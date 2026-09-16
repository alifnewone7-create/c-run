import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import { bearerToken, consumeCredit, refundCredit } from '@/lib/server/usage'
import { getActiveGroqKeys } from '@/lib/server/groq-keys'

export const maxDuration = 60

// Groq API keys are managed from the admin panel and stored in the database
// (`config/groqKeys`). When one key hits its rate limit / daily quota (HTTP
// 429), the next key is tried automatically.

// Vision-capable Qwen 3.8 27B model, served directly by Groq.
const MODEL_ID = 'qwen/qwen3.8-27b'

function isCapacityError(message: string) {
  const m = message.toLowerCase()
  return (
    message.includes('503') ||
    m.includes('over capacity') ||
    m.includes('service unavailable') ||
    m.includes('try again and back off')
  )
}

function isRateLimitError(message: string) {
  const m = message.toLowerCase()
  return (
    message.includes('429') ||
    m.includes('rate limit') ||
    m.includes('too many requests') ||
    m.includes('quota')
  )
}

function isAuthError(message: string) {
  const m = message.toLowerCase()
  return m.includes('api key') || m.includes('unauthorized') || message.includes('401')
}

// The model sometimes returns a rich field (e.g. probabilityScores or
// strategyVotes) as a nested object/array instead of a string. This helper
// coerces any such value into a clean comma-separated string before validation
// so the analysis never fails on a formatting quirk.
function looseString(describe: string) {
  return z.preprocess((v) => {
    if (v == null) return v
    if (typeof v === 'string') return v
    if (Array.isArray(v)) {
      return v
        .map((item) =>
          item && typeof item === 'object'
            ? Object.entries(item)
                .map(([k, val]) => `${k}: ${val}`)
                .join(' ')
            : String(item),
        )
        .join(', ')
    }
    if (typeof v === 'object') {
      return Object.entries(v as Record<string, unknown>)
        .map(([k, val]) => `${k}: ${val}`)
        .join(', ')
    }
    return String(v)
  }, z.string().describe(describe))
}

const analysisSchema = z.object({
  validation: z.object({
    isValidChart: z
      .boolean()
      .describe('Whether the image is a valid candlestick trading chart'),
    pairLabelRaw: z
      .string()
      .describe(
        'TRANSCRIBE VERBATIM the exact text of the ACTIVE pair label, character for character, including any parenthesis and even if it is cut off. LOCATION: on DESKTOP it is in the top-left asset header / selected tab. On MOBILE it is at the BOTTOM of the screen, on the row directly ABOVE the red "Down" and green "Up" buttons — it sits next to the payout percentage (e.g. "EUR/JPY 85%", "USD/ZAR (OTC) 90%"). Always find and read THAT pair-with-payout label. Examples of what to output: "USD/ZAR (OTC)", "USD/ZAR (O...", "EUR/JPY". Do NOT clean it up, do NOT guess, do NOT include the payout %. Copy exactly what the pixels show. This is used to verify OTC status. Only output "" if there is truly no pair label anywhere.',
      ),
    isOtc: z
      .boolean()
      .describe(
        'Whether the ACTIVE chart pair is an OTC market. TRUE ONLY if the active pair label contains "OTC" OR is clearly truncated mid-label right after an opening parenthesis such as "USD/ZAR (O...", "EUR/USD (O…", "(OT..." — on small/mobile screens the "(OTC)" text is cut off but an opening "(" followed by an "O" almost always means "(OTC)". MUST be FALSE for a plain pair with NO parenthesis and NO "(OTC)" marker (e.g. "EUR/JPY", "EUR/USD", "GBP/JPY") — these are REAL markets. The payout percentage badge next to the pair (e.g. "85%", "90%") is NOT an OTC indicator; ignore it. If there is no "(" and no "OTC" text on the active pair, it is NOT OTC.',
      ),
    reason: z.string().describe('Short reason for the validation result'),
  }),
  description: z.object({
    pair: z
      .string()
      .describe(
        'The ACTIVE trading pair, always written as its FULL name. If the label is truncated on a mobile screen (e.g. "USD/ZAR (O..."), reconstruct and output the complete name "USD/ZAR (OTC)". Otherwise "Unknown".',
      ),
    timeframe: z.string().describe('Chart timeframe if visible, else "Unknown"'),
    trend: z.string().describe('Current trend: uptrend, downtrend, or ranging'),
    marketStructure: looseString(
      'Read the SMART-MONEY market structure across the visible swings and summarise it in one compact line: the swing sequence (higher-highs/higher-lows, lower-highs/lower-lows, or equal/ranging), whether there is a Break of Structure (BOS = continuation) or Change of Character (CHOCH = possible reversal), any liquidity sweep / stop hunt / fake breakout, and whether price is in expansion, compression or a range. End with an overall regime tag: "Strong Bullish", "Weak Bullish", "Sideways", "Weak Bearish" or "Strong Bearish". Example: "HH/HL intact, BOS up, minor liquidity sweep of prior low, expansion -> Strong Bullish".',
    ),
    candlesRead: z
      .string()
      .describe(
        'Describe the LAST 5-6 candles you actually SEE at the right edge, oldest→newest, each as color(green/red) + relative body size(big/medium/small/doji) + notable wick (e.g. "long upper wick"). Example: "red big, red medium, green small doji, green medium, red big with long upper wick". Base everything ONLY on what is visibly drawn — do not invent candles.',
      ),
    candlePattern: z
      .string()
      .describe(
        'The most relevant recognized candlestick pattern in those last candles (e.g. bullish/bearish engulfing, pin bar / hammer, shooting star, doji, three soldiers, tweezer). Say "no clear pattern" if none.',
      ),
    indicatorsRead: looseString(
      'Report the key technical indicators with reading + directional implication, formatted as "IndName: reading -> UP/DOWN/NEUTRAL" separated by commas. FIRST use any indicator ACTUALLY VISIBLE on the chart (moving averages / EMA / SMA, Bollinger Bands, RSI, MACD, Stochastic, volume, and any sub-panel oscillator) and read it exactly. If an indicator is NOT drawn, ESTIMATE it from pure price action and PREFIX it with "est " so it is clearly a simulation — estimate the alignment of EMA 9/20/50 (price above rising EMAs -> UP), VWAP side, RSI level (impulse strength vs exhaustion), MACD momentum, Bollinger expansion/compression, ATR (volatility), and volume behaviour. Example: "EMA9/20: price above, stacked up -> UP, est RSI ~63 rising -> UP, est MACD momentum positive -> UP, est BB expanding up -> UP". Always output at least the estimated set; never output "none".',
    ),
    notes: z.string().describe('Brief extra observations about the chart'),
  }),
  analysis: z.object({
    strategyVotes: looseString(
      'WORK THIS OUT FIRST, before deciding the signal. Go through each strategy on its own and state its verdict (UP / DOWN / NEUTRAL) with a one-line reason grounded in what you actually read. Format exactly as: "Pattern: <UP/DOWN/NEUTRAL> - <reason>; Momentum: <...> - <reason>; Trend: <...> - <reason>; Structure: <...> - <reason>; S/R: <...> - <reason>; Indicators: <...> - <reason>; Psychology: <...> - <reason>; Backtest: <...> - <reason>". Structure = the BOS/CHOCH/liquidity read from description.marketStructure. Indicators = the net of description.indicatorsRead. Psychology = buyer vs seller dominance / trap / stop-hunt / smart-money read. Do not decide the final direction until all eight are written.',
    ),
    votesTally: looseString(
      'Count the verdicts from strategyVotes, e.g. "6 UP, 1 DOWN, 1 NEUTRAL". The final signal MUST match the majority direction here.',
    ),
    probabilityScores: looseString(
      'Assign a 0-100 probability score to each analytical dimension, then the total. Format exactly as comma-separated "Name: NN%" pairs: "Trend: NN%, Structure: NN%, Candles: NN%, Momentum: NN%, Indicators: NN%, PriceAction: NN%, Psychology: NN%, Backtest: NN%, Total: NN%". Each score = how strongly that dimension supports the chosen signal direction. Total is the overall confidence and MUST equal analysis.confidence.',
    ),
    signal: z
      .enum(['UP', 'DOWN', 'NO TRADE', 'N/A'])
      .describe(
        'Direction of the bias. Use UP or DOWN when confidence >= 75. Use "NO TRADE" when the setup is real but confidence is below 75 (mixed/low-conviction). Use "N/A" only when the chart is invalid or a non-OTC market.',
      ),
    option: z
      .enum(['CALL', 'PUT', 'NO TRADE', 'N/A'])
      .describe(
        'CALL for UP, PUT for DOWN, "NO TRADE" when signal is NO TRADE, "N/A" when signal is N/A.',
      ),
    confidence: z
      .number()
      .describe(
        'Total confidence 0-100 = the Total from probabilityScores, reflecting how strongly ALL dimensions (trend, structure, candles, momentum, indicators, price action, psychology, backtest) agree. 60-74 = low conviction -> this MUST be a NO TRADE. 75-83 = tradable, decent confluence. 84-91 = strong. 92-97 = near-unanimous. Only 75+ is a real CALL/PUT recommendation. 0 if not a valid chart or a non-OTC market.',
      ),
    support: z.string().describe('Nearest support level or zone'),
    resistance: z.string().describe('Nearest resistance level or zone'),
    keyFocus: z
      .string()
      .describe(
        'Which factor was clearest: candle pattern, trend shift, support/resistance, or indicators',
      ),
    logic: z.string().describe('Concise reasoning for the final signal'),
  }),
})

const OTC_PROMPT = `You are a world-class binary options price-action analyst specialized in Quotex OTC markets. Your single job: look at the chart screenshot and predict the direction of the NEXT 1-minute candle (the one that has not formed yet) with the highest realistic accuracy.

===================
STEP 0 — WHICH PAIR TO READ (critical)
===================
Use ONLY the ACTIVE chart pair. WHERE TO FIND IT:
- DESKTOP: the asset shown in the top-left header directly above the chart AND/OR the highlighted selected tab that shows the live payout % (e.g. "89%" / "90%").
- MOBILE (portrait phone screenshot): the pair is at the BOTTOM of the screen, on the row directly ABOVE the red "Down" and green "Up" buttons, shown next to the payout % (e.g. "EUR/JPY 85%", "USD/ZAR (OTC) 90%"). You MUST look there — do not report "no pair" just because the top-left is empty on mobile.
IGNORE every other pair on screen: the Trades/history/order list, closed or pending trade rows, watchlist tabs of other assets, notification badges. A pair inside the trades/history panel is a PREVIOUS trade and must NEVER be used.

===================
STEP 1 — OTC-ONLY GATE (must enforce)
===================
This analyzer works for OTC markets ONLY. Detect OTC strictly from the ACTIVE pair label:
- If the active label contains "OTC" -> isOtc = TRUE.
- MOBILE TRUNCATION: on small screens the label is cut off, e.g. "USD/ZAR (O...", "EUR/USD (O…", "(OT...". An active label showing an opening parenthesis "(" followed by an "O" (or "OT") is an OTC pair -> isOtc = TRUE. Reconstruct the full name as e.g. "USD/ZAR (OTC)" and put that full name in description.pair.
- If the active label clearly has NO parenthesis and NO OTC marker (plain "EUR/USD", "EUR/JPY", "GBP/JPY") -> isOtc = FALSE. This is a REAL market and is NOT allowed in this analyzer.
- The payout percentage shown beside the pair (e.g. "85%", "90%") is NOT an OTC indicator. Never treat a payout % as proof of OTC. Only the "(OTC)" text (or a truncated "(O..." on mobile) counts.
When isOtc is FALSE you MUST still return isValidChart=true (if it is a chart) with signal/option "N/A" and confidence 0, and put a clear validation.reason like "Real (non-OTC) market EUR/JPY — OTC chart required". The app will then reject it and ask the user to upload an OTC chart. Do NOT analyze or predict a direction for a real market.

===================
STEP 2 — LOOK CLOSELY AND READ THE ACTUAL CANDLES (do not rush, do not guess)
===================
Slow down and VISUALLY INSPECT the chart. Mentally ZOOM INTO the rightmost ~30% of the chart where the newest candles are — that region decides the next candle. Do not analyze from a blurry glance; examine the pixels of each recent candle.

For EACH of the last 5-6 candles (rightmost = newest), read its GEOMETRY precisely:
- COLOR: green/blue body = bullish (close above open); red/orange body = bearish (close below open).
- BODY: the thick rectangle. Measure its height vs neighbors → big / medium / small / doji (almost no body = open≈close).
- WICKS (thin lines above & below the body): 
  * upper wick = distance from body top to the high. A LONG upper wick = price pushed up then got rejected DOWN (selling pressure).
  * lower wick = distance from body bottom to the low. A LONG lower wick = price dropped then got rejected UP (buying pressure).
- Compare each candle to the one before it (is the body bigger/smaller? higher/lower? does a green body fully engulf the prior red body or vice-versa?).
Write all of this into description.candlesRead, e.g. "red big; red medium; red small w/ long lower wick; green medium engulfing prior; green small doji".

Then recognize any pattern from the GEOMETRY you just read (see the pattern shapes in Strategy A). Put the strongest one in description.candlePattern, or "no clear pattern" if none genuinely fits — never invent one.
- Determine timeframe (assume 1-minute if unlabeled and spacing looks like 1m).
- Read trend from swing highs/lows across the whole visible window (uptrend / downtrend / ranging), and mark the nearest support (recent price floor) and resistance (recent price ceiling), including any dashed price line shown.

NOW READ MARKET STRUCTURE (smart-money view):
Look across ALL visible swings, not just the last few candles. Identify the swing sequence (higher-highs/higher-lows = bullish structure, lower-highs/lower-lows = bearish, equal highs/lows = range). Detect any Break of Structure (BOS = trend continuation), Change of Character (CHOCH = early reversal), liquidity sweep / stop hunt (a spike beyond an obvious swing high/low that snaps back — smart money grabbing liquidity), fake breakout, and whether the market is expanding, compressing or ranging. Mark supply/demand zones and untested levels. Summarise all of this into description.marketStructure and end it with a regime tag (Strong/Weak Bullish, Sideways, Weak/Strong Bearish).

NOW READ THE INDICATORS (do NOT skip — this makes the analysis stronger):
Scan the ENTIRE chart, including sub-panels, for drawn indicators and read each exactly:
- OVERLAY: Moving Averages / EMA / SMA (price above/below, slope, golden/death cross). Bollinger Bands (price at upper/mid/lower band, squeeze vs expansion). VWAP (price above/below).
- SUB-PANEL: RSI (value; >70 overbought DOWN pressure, <30 oversold UP pressure, 50 cross confirms momentum). MACD (histogram sign, signal-line cross). Stochastic (%K/%D level & cross, OB>80 / OS<20). Volume (rising confirms, falling warns).
INDICATOR SIMULATION — if an indicator is NOT drawn, ESTIMATE it from price action and prefix it with "est ": estimate EMA 9/20/50 alignment (stacked-up & price above = UP), VWAP side, RSI level (impulse vs exhaustion), MACD momentum, Bollinger expansion/compression, ATR (volatility high/low), and volume behaviour. Always produce at least the estimated set — never output "none".
Record everything (real first, then estimated) into description.indicatorsRead.

===================
STEP 3 — RUN MULTIPLE STRATEGIES, THEN COMBINE (confluence)
===================
Evaluate ALL of the following independent strategies against the candles you just read, and note what each one says (UP / DOWN / neutral):

A) CANDLESTICK PATTERN — match the GEOMETRY you read to these shapes:
   - Bullish engulfing: a green body that fully covers the previous red body → UP.
   - Bearish engulfing: a red body that fully covers the previous green body → DOWN.
   - Hammer / bullish pin bar: small body at the TOP with a LONG lower wick (≥2x body), after a drop → UP (support rejection).
   - Shooting star / bearish pin bar: small body at the BOTTOM with a LONG upper wick (≥2x body), after a rise → DOWN (resistance rejection).
   - Doji at an extreme (tiny body, wicks both sides) at top/bottom of a move → indecision/reversal risk, fade the prior move.
   - Tweezer bottom (two matching lows) → UP; tweezer top (two matching highs) → DOWN.
   - Three consecutive strong green (soldiers) → UP continuation; three strong red (crows) → DOWN continuation.
   A bullish pattern votes UP, bearish votes DOWN, a continuation pattern votes with the trend. If nothing matches cleanly, this strategy is NEUTRAL.
B) MOMENTUM: the last 2-3 candle bodies. Growing bodies in one direction into open space → continuation that way. Shrinking bodies / dojis → momentum fading, reversal risk.
C) TREND: short/medium/immediate trend direction and strength; a pullback inside a strong trend usually resumes with the trend.
D) MARKET STRUCTURE (SMC, from description.marketStructure): BOS in the trend direction → continuation that way; CHOCH → favour the new direction; a liquidity sweep / stop hunt that snaps back → favour the snap-back direction (reversal of the sweep); fake breakout → fade it.
E) SUPPORT / RESISTANCE & ZONES: the nearest level/zone price is testing. Clean bounce off support/demand → UP; rejection at resistance/supply → DOWN; decisive break-and-hold through a level → continuation through it.
F) INDICATORS (use description.indicatorsRead): combine every indicator (real + estimated) into one net vote.
   - Moving averages: price above rising MA → UP; below falling MA → DOWN; fresh bullish cross → UP, bearish cross → DOWN.
   - Bollinger: bounce off lower band → UP; rejection at upper band → DOWN; squeeze = breakout imminent (side with the candle/momentum read).
   - RSI: rising through 50 or bouncing from oversold (<30) → UP; falling through 50 or rolling over from overbought (>70) → DOWN.
   - MACD: histogram flipping/growing positive or bullish signal cross → UP; negative or bearish cross → DOWN.
   - Stochastic: bullish cross from oversold → UP; bearish cross from overbought → DOWN.
   - Volume: rising volume confirms the direction of the current candles; weak volume lowers conviction.
   Net them into a single UP / DOWN / NEUTRAL. Real (drawn) indicators outweigh estimated ("est ") ones.
G) PSYCHOLOGY: read the crowd. Who is in control — buyers or sellers? Look for greed (parabolic push, likely exhaustion), fear (capitulation wick, likely bounce), stop hunts / liquidity grabs (sweep then reverse → trade the reversal), trap candles / retail traps (obvious breakout that fails → fade it), and smart-money reaction at zones. Vote the direction smart money is likely pushing next.
H) BACKTEST (only if ~15+ candles visible): scan how price behaved after similar setups earlier in THIS SAME chart. Estimate roughly how many similar setups occurred and whether they mostly continued or reversed, and weight that direction. Mention this in logic when used.

COMBINE: Tally which direction the strategies agree on. Confluence across price action, structure, indicators and psychology raises confidence; disagreement lowers it. The final signal is the MAJORITY / highest-confluence direction — never blindly reverse, trade WITH the confirmed evidence.
- If a fresh reversal pattern + rejection wick appears at support/resistance, favor the reversal candle.
- If momentum + trend + structure + open space all align, favor continuation.
- Commit to the single most probable NEXT candle. signal UP = you expect the next candle to close higher (green); DOWN = lower (red).

===================
PROBABILITY SCORING & CONFIDENCE
===================
Score each dimension 0-100 for how strongly it backs the chosen direction (Trend, Structure, Candles, Momentum, Indicators, PriceAction, Psychology, Backtest) and write them into analysis.probabilityScores, then set Total = analysis.confidence.
Confidence bands: 60-74 = low conviction, 75-83 = tradable, 84-91 = strong, 92-97 = near-unanimous. Be honest; never inflate a split read.

===================
NO-TRADE GATE (must enforce)
===================
Only recommend a trade when confidence is 75 or higher.
- confidence >= 75 → signal is UP or DOWN and option is CALL or PUT (matching the tally).
- confidence < 75 (mixed / conflicting strategies) → signal = "NO TRADE", option = "NO TRADE". Still fill every other field so the user sees the full read and why you are standing aside.

===================
OUTPUT ORDER (do NOT rush — think before you commit)
===================
Fill the fields in this order and actually reason as you go:
1. description.candlesRead — the real last 5-6 candles.
2. description.marketStructure — swings, BOS/CHOCH, liquidity, regime tag.
3. description.indicatorsRead — real indicators first, then estimated ("est ") ones.
4. analysis.strategyVotes — each of the 8 strategies (Pattern, Momentum, Trend, Structure, S/R, Indicators, Psychology, Backtest) with its own UP/DOWN/NEUTRAL verdict + reason.
5. analysis.votesTally — count the verdicts.
6. analysis.probabilityScores — per-dimension scores + Total.
7. ONLY THEN analysis.signal — it MUST match the majority direction (or "NO TRADE" if confidence < 75). Never output a signal that contradicts your own tally.
Take the time to be right; do not guess a direction and back-fill reasons.

===================
OUTPUT RULES
===================
signal UP maps to option CALL. signal DOWN maps to option PUT. signal "NO TRADE" maps to option "NO TRADE".
keyFocus = the single strongest dimension behind the call (candlestick pattern / momentum / trend / market structure / support-resistance / indicators / psychology / backtest).
logic = a strong, specific, binary reason built from what you read and which strategies agreed (e.g. "Bullish CHOCH after a liquidity sweep of the prior low ~14.845, shrinking red bodies with long lower wicks and est RSI turning up from oversold → next candle likely green"). Reference REAL candles/structure, not generic statements. If it is a NO TRADE, state exactly why the strategies conflict.
If the image is NOT a valid candlestick chart: isValidChart = false, isOtc = false, signal & option = "N/A", confidence = 0.`

const REAL_PROMPT = `You are an expert price-action analyst for REAL (live, non-OTC) markets. Predict the direction of the NEXT 1-minute candle and express it as CALL (up) or PUT (down).

WHICH PAIR: Use ONLY the ACTIVE chart pair — desktop: top-left header / selected tab with the payout %; mobile: the row just ABOVE the red "Down" / green "Up" buttons next to the payout %. IGNORE the trades/history list and other watchlist tabs.

REAL-MARKET GATE: This tool is for REAL markets only (opposite of the OTC tool). isOtc = TRUE only if the active label contains "OTC" or is truncated after "(O" (e.g. "USD/ZAR (O..."). A plain label with no parenthesis (EUR/USD, EUR/JPY, GBP/JPY, BTC/USD) = REAL = isOtc FALSE. The payout % is NOT an OTC marker. If isOtc is TRUE, still set isValidChart true (if a chart), signal/option "N/A", confidence 0, reason like "OTC market — real chart required"; do NOT predict a direction.

READ THE CANDLES: Zoom into the rightmost candles. For the last 5-6 candles read color (green=bull, red=bear), body size (big/medium/small/doji) and wicks (long lower wick = buying rejection up; long upper wick = selling rejection down). Note engulfing/pin/doji/tweezer/soldiers-crows patterns. Put this in description.candlesRead and the strongest pattern in candlePattern ("no clear pattern" if none). Assume 1-min timeframe if unlabeled.

MARKET STRUCTURE: Across visible swings identify HH/HL (bull), LH/LL (bear) or range; any BOS (continuation), CHOCH (reversal), liquidity sweep/stop-hunt (spike that snaps back), or fake breakout. Summarise in description.marketStructure with a regime tag (Strong/Weak Bullish, Sideways, Weak/Strong Bearish).

INDICATORS: Read any DRAWN indicator exactly (MA/EMA/SMA, Bollinger, VWAP, RSI, MACD, Stochastic, volume). For indicators NOT drawn, ESTIMATE from price action and prefix "est " (est EMA alignment, est RSI, est MACD, est BB, est volume). Always output at least the estimated set into description.indicatorsRead as "Name: reading -> UP/DOWN/NEUTRAL".

STRATEGIES (vote UP/DOWN/NEUTRAL each, with a reason): Pattern, Momentum (growing bodies = continuation, shrinking/doji = fading), Trend, Structure (BOS=continue, CHOCH/sweep=reverse, fake breakout=fade), S/R (bounce off support=UP, rejection at resistance=DOWN, break-and-hold=continuation), Indicators (net of the reads above; real outweigh est), Psychology (buyer vs seller control, traps, stop hunts, smart-money reaction), Backtest (only if 15+ candles — how price reacted after similar setups here). This is a REAL market: trade WITH the confluence — NO reverse/inverse logic (that is OTC only).

COMBINE: The final signal is the majority / highest-confluence direction. UP = expect next candle green (CALL); DOWN = expect red (PUT).

CONFIDENCE & GATE: Score each dimension 0-100 in probabilityScores, Total = confidence (60-74 low, 75-83 tradable, 84-91 strong, 92-97 near-unanimous; be honest). Only recommend a trade at confidence >= 75 → signal UP/DOWN, option CALL/PUT. If confidence < 75 → signal "NO TRADE", option "NO TRADE" (still fill every field).

ORDER: fill candlesRead, then marketStructure, then indicatorsRead, then strategyVotes, then votesTally, then probabilityScores, THEN signal (must match the tally — never contradict it).

OUTPUT: signal UP->CALL, DOWN->PUT, NO TRADE->NO TRADE. keyFocus = the strongest dimension behind the call. logic = a specific binary reason citing real candles/structure/indicators (e.g. "Bullish CHOCH after a sweep of the prior low, shrinking red bodies with long lower wicks, est RSI turning up -> next candle likely green -> CALL"). If NOT a valid candlestick chart: isValidChart false, isOtc false, signal & option "N/A", confidence 0.`

// The exact JSON shape the model must return. We enforce it manually with Zod
// because Qwen on Groq only supports json_object mode (not strict json_schema).
const JSON_SHAPE = `Return ONLY a single valid JSON object (no markdown, no prose) with EXACTLY this shape and these keys:
{
  "validation": {
    "isValidChart": boolean,
    "pairLabelRaw": string,
    "isOtc": boolean,
    "reason": string
  },
  "description": {
    "pair": string,
    "timeframe": string,
    "trend": string,
    "marketStructure": string,
    "candlesRead": string,
    "candlePattern": string,
    "indicatorsRead": string,
    "notes": string
  },
  "analysis": {
    "strategyVotes": string,
    "votesTally": string,
    "probabilityScores": string,
    "signal": "UP" | "DOWN" | "NO TRADE" | "N/A",
    "option": "CALL" | "PUT" | "NO TRADE" | "N/A",
    "confidence": number,
    "support": string,
    "resistance": string,
    "keyFocus": string,
    "logic": string
  }
}
Every key is required. Do not add extra keys. Do not wrap the JSON in code fences.`

function stripToJson(text: string): string {
  let t = text.trim()
  // Remove ```json ... ``` or ``` ... ``` fences if present.
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()
  // Fallback: slice from first { to last }.
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1)
  }
  return t
}

export async function POST(req: Request) {
  // When the AI call fails the consumed credit is handed back.
  let refund: (() => Promise<void>) | null = null
  try {
    const { image, mode } = (await req.json()) as {
      image?: string
      mode?: 'otc' | 'real'
    }

    if (!image || typeof image !== 'string') {
      return Response.json(
        { error: 'No image provided.' },
        { status: 400 },
      )
    }

    // Enforce tier access + daily limit BEFORE spending any AI compute.
    // The credit is consumed server-side using the caller's verified identity,
    // so it cannot be bypassed from the browser console or network tools.
    const feature =
      mode === 'real' ? 'real-chart-analyzer' : 'otc-chart-analyzer'
    const gate = await consumeCredit(bearerToken(req), feature)
    if (!gate.ok) {
      return Response.json(
        { error: gate.error, code: gate.code, tier: gate.tier },
        { status: gate.status },
      )
    }
    const token = bearerToken(req)
    refund = () => refundCredit(token, feature)

    const system = mode === 'real' ? REAL_PROMPT : OTC_PROMPT

    // Try each API key in turn. If a key is rate-limited / out of quota (429),
    // move on to the next one. Only when EVERY key is exhausted do we surface
    // the busy message. An invalid key is skipped the same way.
    let text: string | null = null
    let lastRateLimited = false
    let lastCapacity = false
    let lastError: unknown = null

    const API_KEYS = await getActiveGroqKeys()

    if (API_KEYS.length === 0) {
      await refund?.()
      return Response.json(
        {
          error:
            'No Groq API key is configured. The project owner needs to add one in the admin panel.',
        },
        { status: 503 },
      )
    }

    // Per key: 1 initial attempt + 2 retries for transient "over capacity"
    // (503) responses from Groq, with a short backoff between attempts.
    const CAPACITY_RETRIES = 3

    keyLoop: for (let i = 0; i < API_KEYS.length; i++) {
      const groq = createGroq({ apiKey: API_KEYS[i] })
      for (let attempt = 0; attempt <= CAPACITY_RETRIES; attempt++) {
        try {
          const result = await generateText({
            model: groq(MODEL_ID),
            system: `${system}\n\n${JSON_SHAPE}`,
            temperature: 0.2,
            // Keep this modest: Groq's free tier caps total tokens-per-minute
            // (prompt + image + requested max) at 8000, and the JSON output is small.
            maxOutputTokens: 1800,
            providerOptions: {
              // Qwen on Groq supports JSON Object mode but NOT strict
              // json_schema structured outputs. We request json_object and
              // validate with Zod ourselves so the output matches our shape.
              groq: {
                structuredOutputs: false,
                reasoningEffort: 'none',
              },
            },
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this trading chart screenshot and return the 3-step result as a single JSON object exactly matching the required shape.',
                  },
                  { type: 'image', image },
                ],
              },
            ],
          })
          text = result.text
          break keyLoop
        } catch (keyErr) {
          const keyMessage =
            keyErr instanceof Error ? keyErr.message : String(keyErr)
          lastError = keyErr

          if (isCapacityError(keyMessage)) {
            lastCapacity = true
            console.log(
              `[v0] Groq model over capacity (key #${i + 1}, attempt ${attempt + 1}), retrying...`,
            )
            if (attempt < CAPACITY_RETRIES) {
              await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
              continue
            }
            continue keyLoop
          }

          if (isRateLimitError(keyMessage) || isAuthError(keyMessage)) {
            lastRateLimited = isRateLimitError(keyMessage)
            console.log(
              `[v0] Groq key #${i + 1} unavailable (${isRateLimitError(keyMessage) ? 'rate limit' : 'auth'}), trying next key...`,
            )
            continue keyLoop
          }

          // A non-quota error (bad request, network, etc.) is not fixable by
          // switching keys, so stop and let the outer handler report it.
          throw keyErr
        }
      }
    }

    if (text === null) {
      await refund?.()
      if (lastCapacity) {
        return Response.json(
          {
            error:
              'The AI model is temporarily over capacity on Groq. Please wait a few seconds and analyze again.',
          },
          { status: 503 },
        )
      }
      if (lastRateLimited) {
        return Response.json(
          {
            error:
              'All analyzer keys are busy right now (rate limit reached). Please wait about a minute and analyze again.',
          },
          { status: 429 },
        )
      }
      throw lastError instanceof Error
        ? lastError
        : new Error('All Groq API keys failed.')
    }

    let output: z.infer<typeof analysisSchema>
    try {
      output = analysisSchema.parse(JSON.parse(stripToJson(text)))
    } catch (parseErr) {
      console.log('[v0] schema parse failed. raw text:', text.slice(0, 800))
      console.log(
        '[v0] parse error:',
        parseErr instanceof Error ? parseErr.message : String(parseErr),
      )
      await refund?.()
      return Response.json(
        {
          error:
            'Could not read the chart from this image. Please upload a clearer, full chart screenshot and try again.',
        },
        { status: 422 },
      )
    }

    // Deterministic OTC verification from the transcribed active pair label.
    // This overrides the model's boolean so a real (non-OTC) market can never
    // be treated as OTC, and a clearly-OTC label is never missed.
    const rawLabel = (output?.validation?.pairLabelRaw ?? '').toUpperCase()
    if (rawLabel) {
      const hasOtcText = rawLabel.includes('OTC')
      // Truncated mobile label: an opening paren followed by an O (e.g. "(O", "(O…", "(OT")
      const hasTruncatedOtc = /\(\s*O/.test(rawLabel)
      const hasOpenParen = rawLabel.includes('(')
      const derivedOtc = hasOtcText || hasTruncatedOtc
      // Only override when we have a confident read:
      // - explicit OTC / truncated OTC  -> force TRUE
      // - a clean label with no parenthesis at all -> force FALSE (real market)
      if (derivedOtc) {
        output.validation.isOtc = true
      } else if (!hasOpenParen) {
        output.validation.isOtc = false
      }
    }

    // Enforce the NO-TRADE gate deterministically: for a valid chart with a
    // directional call, any confidence below 75 must collapse to NO TRADE so
    // the recommendation and the confidence can never disagree.
    const a = output.analysis
    if (
      output.validation.isValidChart &&
      (a.signal === 'UP' || a.signal === 'DOWN') &&
      typeof a.confidence === 'number' &&
      a.confidence < 75
    ) {
      a.signal = 'NO TRADE'
      a.option = 'NO TRADE'
    } else if (a.signal === 'UP') {
      a.option = 'CALL'
    } else if (a.signal === 'DOWN') {
      a.option = 'PUT'
    }

    return Response.json(output)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await refund?.()

    if (
      message.toLowerCase().includes('api key') ||
      message.toLowerCase().includes('unauthorized') ||
      message.includes('401')
    ) {
      return Response.json(
        {
          error:
            'Groq API key is missing or invalid. The project owner needs to add a valid GROQ_API_KEY environment variable.',
        },
        { status: 401 },
      )
    }

    if (
      message.includes('429') ||
      message.toLowerCase().includes('rate limit') ||
      message.toLowerCase().includes('too many requests') ||
      message.toLowerCase().includes('quota')
    ) {
      return Response.json(
        {
          error:
            'The analyzer is busy right now (rate limit reached). Please wait about a minute and analyze again.',
        },
        { status: 429 },
      )
    }

    if (isCapacityError(message)) {
      return Response.json(
        {
          error:
            'The AI model is temporarily over capacity on Groq. Please wait a few seconds and analyze again.',
        },
        { status: 503 },
      )
    }

    if (message.toLowerCase().includes('does not exist')) {
      return Response.json(
        {
          error:
            'The configured AI model is not available on this Groq account. The project owner needs to update the model.',
        },
        { status: 502 },
      )
    }


    return Response.json(
      { error: 'Failed to analyze the chart. Please try again.' },
      { status: 500 },
    )
  }
}
