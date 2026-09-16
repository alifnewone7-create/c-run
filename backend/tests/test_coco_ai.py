"""Backend/API tests for Coco AI (Next.js app).

Covers:
  * BUG FIX: /api/analyze no longer returns the generic 500
    'Failed to analyze the chart' for the model-id reason. Must either
    succeed (200) OR return a clear 503/429 capacity/rate-limit message.
  * Credit refund on AI failure (admin panel usageToday BEFORE == AFTER).
  * Admin panel Groq key management (login, list, add, pause, delete).
"""
import base64
import io
import os
import time

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://instant-repo-run.preview.emergentagent.com").rstrip("/")

FIREBASE_API_KEY = "AIzaSyAo1DFoWoWo-W5zFEf5IqSJN6GB1EHp7Bo"
TEST_EMAIL = "qatester01@cocomail.test"
TEST_PASSWORD = "CocoTest!2026"

ADMIN_USER = "iamhear"
ADMIN_PASS = "iamhear"
ADMIN_SECRET = "iamhear"


# --- Firebase token helper ---
@pytest.fixture(scope="session")
def firebase_id_token():
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    r = requests.post(url, json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "returnSecureToken": True}, timeout=20)
    if r.status_code != 200:
        pytest.skip(f"Firebase login failed: {r.status_code} {r.text[:200]}")
    return r.json()["idToken"]


# --- Admin session helper ---
@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/admin/login",
               json={"username": ADMIN_USER, "password": ADMIN_PASS, "secretKey": ADMIN_SECRET},
               timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


# --- Small candlestick-looking PNG so Groq returns parseable JSON ---
def _tiny_png_b64():
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        # Fallback: 1x1 red PNG (may cause schema-parse 500 on model side)
        b = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108020000009077"
            "3DDE0000000C4944415478DA6364F8CFC0000000030001010A2DE4210000000049454E44AE426082"
        )
        return "data:image/png;base64," + base64.b64encode(b).decode()
    import random
    random.seed(1)
    img = Image.new("RGB", (400, 200), "black")
    d = ImageDraw.Draw(img)
    x = 10
    for _ in range(20):
        color = "green" if random.random() > 0.5 else "red"
        top = random.randint(30, 80)
        bot = random.randint(100, 170)
        d.line([(x + 7, top - 15), (x + 7, bot + 15)], fill="white", width=1)
        d.rectangle([x, top, x + 14, bot], fill=color)
        x += 18
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


# ============================================================
# Admin login & Groq key management
# ============================================================
class TestAdminGroqKeys:
    dummy_key = "gsk_abcabcabcabcabcabcabc123"
    dummy_label = "TEST_dummy_key"

    def test_admin_login_success(self, admin_session):
        # Just calling the fixture asserts login worked
        assert admin_session is not None

    def test_list_keys_returns_array(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/admin/groq-keys", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "keys" in data and isinstance(data["keys"], list)
        # All keys should be masked, never returned in cleartext
        for k in data["keys"]:
            assert "masked" in k
            assert not k["masked"].startswith("gsk_") or "•" in k["masked"], k

    def test_add_pause_delete_dummy_key(self, admin_session):
        # ADD
        r = admin_session.post(
            f"{BASE_URL}/api/admin/groq-keys",
            json={"key": self.dummy_key, "label": self.dummy_label},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        added = r.json()["key"]
        assert added["label"] == self.dummy_label
        assert "•" in added["masked"]
        key_id = added["id"]

        try:
            # LIST -> must contain the dummy
            r = admin_session.get(f"{BASE_URL}/api/admin/groq-keys", timeout=20)
            assert r.status_code == 200
            assert any(k["id"] == key_id for k in r.json()["keys"])

            # PAUSE (disable)
            r = admin_session.patch(
                f"{BASE_URL}/api/admin/groq-keys",
                json={"id": key_id, "disabled": True},
                timeout=20,
            )
            assert r.status_code == 200, r.text
            r = admin_session.get(f"{BASE_URL}/api/admin/groq-keys", timeout=20)
            row = next(k for k in r.json()["keys"] if k["id"] == key_id)
            assert row["disabled"] is True

            # UNPAUSE
            r = admin_session.patch(
                f"{BASE_URL}/api/admin/groq-keys",
                json={"id": key_id, "disabled": False},
                timeout=20,
            )
            assert r.status_code == 200
        finally:
            # DELETE (cleanup — do NOT touch real key)
            r = admin_session.delete(
                f"{BASE_URL}/api/admin/groq-keys",
                json={"id": key_id},
                timeout=20,
            )
            assert r.status_code == 200
            r = admin_session.get(f"{BASE_URL}/api/admin/groq-keys", timeout=20)
            assert not any(k["id"] == key_id for k in r.json()["keys"])

    def test_reject_invalid_key_prefix(self, admin_session):
        r = admin_session.post(
            f"{BASE_URL}/api/admin/groq-keys",
            json={"key": "not_a_groq_key_123456789", "label": "bad"},
            timeout=20,
        )
        assert r.status_code == 400
        assert "gsk_" in r.json().get("error", "")

    def test_unauthorized_without_cookie(self):
        r = requests.get(f"{BASE_URL}/api/admin/groq-keys", timeout=20)
        assert r.status_code == 401


# ============================================================
# /api/analyze — the BUG-FIX contract
# ============================================================
def _find_user_row(admin_session, email):
    r = admin_session.get(f"{BASE_URL}/api/admin/users", timeout=30)
    assert r.status_code == 200, r.text
    for u in r.json().get("users", []):
        if u.get("email", "").lower() == email.lower():
            return u
    return None


class TestAnalyzeEndpoint:
    def test_analyze_no_generic_500_and_credit_refunded_on_failure(
        self, firebase_id_token, admin_session
    ):
        # Capture usage BEFORE
        before = _find_user_row(admin_session, TEST_EMAIL)
        assert before is not None, f"Test user {TEST_EMAIL} not found in admin users list"
        before_count = int(before["usageToday"].get("otc-chart-analyzer", 0))

        # Call analyze
        r = requests.post(
            f"{BASE_URL}/api/analyze",
            headers={
                "Authorization": f"Bearer {firebase_id_token}",
                "Content-Type": "application/json",
            },
            json={"image": _tiny_png_b64(), "mode": "otc"},
            timeout=90,
        )
        body = {}
        try:
            body = r.json()
        except Exception:
            body = {"_raw": r.text[:400]}

        print(f"[analyze] status={r.status_code} body={str(body)[:400]}")

        # The KEY invariant: no generic 500 "Failed to analyze the chart"
        # caused by the wrong model id. Acceptable outcomes:
        #  - 200: full analysis
        #  - 503: over-capacity clear message
        #  - 429: rate limit clear message
        #  - 502: model unavailable (also clear)
        #  - 500 only if error message is NOT the generic one AND clearly
        #    describes a different real fault
        assert r.status_code in (200, 429, 502, 503), (
            f"Unexpected status {r.status_code}. Body: {body}"
        )

        if r.status_code == 503:
            err = str(body.get("error", "")).lower()
            assert "over capacity" in err or "temporarily" in err, (
                f"503 must carry the clear capacity message, got: {body}"
            )
        elif r.status_code == 429:
            err = str(body.get("error", "")).lower()
            assert "rate limit" in err or "busy" in err, body
        elif r.status_code == 200:
            # Full analysis object
            assert "analysis" in body and "validation" in body, body

        # Give the DB a moment to settle (refund is fire-and-forget-ish)
        time.sleep(1.5)

        # Capture usage AFTER
        after = _find_user_row(admin_session, TEST_EMAIL)
        after_count = int(after["usageToday"].get("otc-chart-analyzer", 0))

        if r.status_code == 200:
            # Success -> credit spent
            assert after_count == before_count + 1, (
                f"Expected +1 credit on success. before={before_count} after={after_count}"
            )
        else:
            # Failure -> credit refunded
            assert after_count == before_count, (
                f"Credit was NOT refunded on failure. before={before_count} after={after_count}"
            )

    def test_analyze_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/analyze",
            json={"image": _tiny_png_b64(), "mode": "otc"},
            timeout=30,
        )
        assert r.status_code == 401, r.text

    def test_analyze_rejects_missing_image(self, firebase_id_token):
        r = requests.post(
            f"{BASE_URL}/api/analyze",
            headers={"Authorization": f"Bearer {firebase_id_token}"},
            json={"mode": "otc"},
            timeout=30,
        )
        # 400 (no image) is fine; anything but 500-generic
        assert r.status_code in (400, 401), r.text
