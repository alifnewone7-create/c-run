export type TradeResult = 'pending' | 'win' | 'loss' | 'loss-mtg' | 'mtg'

export interface TradeConfig {
  /** Starting balance in dollars */
  initialCapital: number
  /** Average payout percent for the pair(s), e.g. 90 */
  averagePayout: number
  /** Profit target as a percent of the initial capital, e.g. 30 */
  profitTarget: number
  /** Risk per trade as a percent of the initial capital, e.g. 10 */
  riskPerTrade: number
  /** Whether Martingale (double after loss) is enabled */
  mtg: boolean
}

export interface TradeRow {
  /** 1-based position in the sheet */
  index: number
  /** Stake for this trade in dollars */
  amount: number
  result: TradeResult
  /** Profit (+) or loss (-) produced by this trade */
  pnl: number
  /** Running profit after this trade */
  cumulative: number
  /** True when this stake was doubled by Martingale (recovery trade) */
  isMtg: boolean
  /** True when the target is first reached at this row */
  reachesTarget: boolean
  /** True when this row is a planned (not-yet-traded) trade */
  pending: boolean
}

export interface Sheet {
  rows: TradeRow[]
  /** Dollar value of the profit target */
  profitTargetAmount: number
  /** Base stake actually used (clamped to the minimum) */
  baseRiskAmount: number
  /** Base stake before the minimum clamp */
  rawRiskAmount: number
  /** Profit produced by a single base win */
  perWinProfit: number
  /** True when raw risk fell below the $1 minimum */
  belowMinimum: boolean
  /** True when the plan reaches the profit target */
  targetHit: boolean
  /** Realized running profit (concrete win/loss results only) */
  finalProfit: number
  /** Projected running profit assuming every pending trade wins */
  projectedProfit: number
  /** Number of planned (not-yet-traded) rows */
  pendingCount: number
  /** Number of concrete trades marked so far (wins + losses) */
  tradesDone: number
  wins: number
  losses: number
}

export const MIN_TRADE = 1
const MAX_ROWS = 120

function isValid(c: TradeConfig) {
  return (
    c.initialCapital > 0 &&
    c.averagePayout > 0 &&
    c.profitTarget > 0 &&
    c.riskPerTrade > 0
  )
}

function derive(c: TradeConfig) {
  const payoutFrac = c.averagePayout / 100
  const profitTargetAmount = c.initialCapital * (c.profitTarget / 100)
  const rawRiskAmount = c.initialCapital * (c.riskPerTrade / 100)
  const baseRiskAmount = Math.max(MIN_TRADE, rawRiskAmount)
  const belowMinimum = rawRiskAmount < MIN_TRADE - 1e-9
  const perWinProfit = baseRiskAmount * payoutFrac
  return { payoutFrac, profitTargetAmount, rawRiskAmount, baseRiskAmount, belowMinimum, perWinProfit }
}

/**
 * Simulate a fixed list of results into a full sheet. Does not append or trim —
 * use normalizeResults() first to size the list to the profit target.
 */
export function simulate(config: TradeConfig, results: TradeResult[]): Sheet {
  const { payoutFrac, profitTargetAmount, rawRiskAmount, baseRiskAmount, belowMinimum, perWinProfit } =
    derive(config)

  const rows: TradeRow[] = []
  let realized = 0 // concrete results only
  let projected = 0 // realized + pending planned wins
  let stake = baseRiskAmount
  let lastWasLoss = false
  let targetSeen = false
  let wins = 0
  let losses = 0
  let pendingCount = 0

  for (const result of results) {
    let amount = stake
    let isMtg = config.mtg && lastWasLoss
    let pnl: number

    if (result === 'pending') {
      // Planned trade: projected as a base (or recovery) win, but not realized.
      pnl = amount * payoutFrac
      projected += pnl
      pendingCount++
      rows.push({
        index: rows.length + 1,
        amount,
        result,
        pnl,
        cumulative: projected,
        isMtg,
        reachesTarget: false,
        pending: true,
      })
      // The plan assumes this trade wins, so the next stake returns to base.
      stake = baseRiskAmount
      lastWasLoss = false
      continue
    }

    if (result === 'loss-mtg') {
      // The trade and its doubled martingale recovery both lost:
      // total hit = base stake + 2× stake = 3× stake. Sequence ends, restart at base.
      isMtg = true
      pnl = -(amount + amount * 2)
      stake = baseRiskAmount
      lastWasLoss = false
      losses++
    } else if (result === 'loss') {
      pnl = -amount
      stake = config.mtg ? amount * 2 : baseRiskAmount
      lastWasLoss = true
      losses++
    } else {
      // 'win' or 'mtg' — both are winning outcomes.
      // An 'mtg' trade is an explicit martingale recovery: if it is not already
      // riding a doubled stake from a preceding loss, force the doubled stake.
      if (result === 'mtg' && config.mtg) {
        if (!isMtg) amount = baseRiskAmount * 2
        isMtg = true
      }
      pnl = amount * payoutFrac
      stake = baseRiskAmount
      lastWasLoss = false
      wins++
    }

    realized += pnl
    projected += pnl

    const reachesTarget = !targetSeen && realized >= profitTargetAmount - 1e-9
    if (reachesTarget) targetSeen = true

    rows.push({
      index: rows.length + 1,
      amount,
      result,
      pnl,
      cumulative: projected,
      isMtg,
      reachesTarget,
      pending: false,
    })
  }

  return {
    rows,
    profitTargetAmount,
    baseRiskAmount,
    rawRiskAmount,
    perWinProfit,
    belowMinimum,
    targetHit: realized >= profitTargetAmount - 1e-9,
    finalProfit: realized,
    projectedProfit: projected,
    pendingCount,
    tradesDone: wins + losses,
    wins,
    losses,
  }
}

/**
 * Grow or trim a results list so the sheet is exactly long enough to hit the
 * profit target. Idempotent: normalize(normalize(x)) === normalize(x).
 *
 * Concrete choices the user made (win/loss/mtg) are preserved and replayed until
 * their realized profit reaches the target. Any remaining trades needed to reach
 * the target are appended as neutral 'pending' rows — nothing defaults to a win.
 */
export function normalizeResults(config: TradeConfig, results: TradeResult[]): TradeResult[] {
  if (!isValid(config)) return []

  const { payoutFrac, profitTargetAmount, baseRiskAmount } = derive(config)
  const out: TradeResult[] = []
  let realized = 0
  let projected = 0
  let stake = baseRiskAmount
  let lastWasLoss = false

  const stepConcrete = (result: TradeResult) => {
    let amount = stake
    if (result === 'loss-mtg') {
      const pnl = -(amount + amount * 2)
      realized += pnl
      projected += pnl
      stake = baseRiskAmount
      lastWasLoss = false
    } else if (result === 'loss') {
      const pnl = -amount
      realized += pnl
      projected += pnl
      stake = config.mtg ? amount * 2 : baseRiskAmount
      lastWasLoss = true
    } else {
      if (result === 'mtg' && config.mtg && !lastWasLoss) amount = baseRiskAmount * 2
      const pnl = amount * payoutFrac
      realized += pnl
      projected += pnl
      stake = baseRiskAmount
      lastWasLoss = false
    }
    out.push(result)
  }

  // Replay only the user's concrete choices, stopping once realized hits target.
  for (const r of results) {
    if (r === 'pending') continue
    if (realized >= profitTargetAmount - 1e-9) break
    stepConcrete(r)
  }

  // Append planned (pending) trades until the projected balance reaches target.
  let guard = 0
  while (projected < profitTargetAmount - 1e-9 && guard < MAX_ROWS) {
    const amount = stake
    projected += amount * payoutFrac
    stake = baseRiskAmount
    lastWasLoss = false
    out.push('pending')
    guard++
  }

  return out
}

export function fmtMoney(n: number) {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(2)}`
}
