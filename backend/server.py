from fastapi import FastAPI, Request
from fastapi.responses import Response
import httpx

NEXT_ORIGIN = "http://localhost:3000"

app = FastAPI()
client = httpx.AsyncClient(base_url=NEXT_ORIGIN, timeout=120.0, follow_redirects=False)

HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-encoding",
    "content-length",
    "host",
}


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def proxy_to_next(path: str, request: Request):
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}
    upstream = await client.request(
        request.method,
        f"/api/{path}",
        params=request.query_params,
        headers=headers,
        content=await request.body(),
    )
    response = Response(content=upstream.content, status_code=upstream.status_code)
    response.raw_headers = [
        (k.encode("latin-1"), v.encode("latin-1"))
        for k, v in upstream.headers.multi_items()
        if k.lower() not in HOP_BY_HOP
    ]
    return response


@app.on_event("shutdown")
async def close_client():
    await client.aclose()
