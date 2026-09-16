import { Bitcoin, DollarSign, Coins, CircleDollarSign, Gem } from 'lucide-react'

type Coin = {
  Icon: typeof Bitcoin
  label: string
  /** position + sizing + animation tuning */
  className: string
  size: string
  delay: string
  duration: string
}

const COINS: Coin[] = [
  {
    Icon: Bitcoin,
    label: 'Bitcoin',
    className: 'left-[1%] top-[8%]',
    size: 'h-10 w-10 sm:h-14 sm:w-14',
    delay: '0s',
    duration: '7s',
  },
  {
    Icon: Gem,
    label: 'Ethereum',
    className: 'left-[2%] bottom-[14%]',
    size: 'h-9 w-9 sm:h-12 sm:w-12',
    delay: '1.2s',
    duration: '9s',
  },
  {
    Icon: CircleDollarSign,
    label: 'Stablecoin',
    className: 'right-[3%] top-[10%]',
    size: 'h-11 w-11 sm:h-14 sm:w-14',
    delay: '0.6s',
    duration: '8s',
  },
  {
    Icon: Coins,
    label: 'Altcoins',
    className: 'right-[2%] bottom-[16%]',
    size: 'h-9 w-9 sm:h-11 sm:w-11',
    delay: '2s',
    duration: '10s',
  },
  {
    Icon: DollarSign,
    label: 'Token',
    className: 'left-[46%] top-[2%] hidden lg:flex',
    size: 'h-9 w-9 sm:h-10 sm:w-10',
    delay: '1.6s',
    duration: '8.5s',
  },
  {
    Icon: Bitcoin,
    label: 'Bitcoin',
    className: 'right-[40%] bottom-[6%] hidden lg:flex',
    size: 'h-9 w-9 sm:h-12 sm:w-12',
    delay: '2.6s',
    duration: '9.5s',
  },
]

export function CryptoFlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {COINS.map((coin, i) => (
        <span
          key={i}
          className={`coin-drift absolute flex items-center justify-center rounded-full border border-primary/50 bg-primary/20 text-primary-foreground opacity-80 shadow-lg shadow-primary/40 ring-1 ring-primary/30 backdrop-blur-sm ${coin.className} ${coin.size}`}
          style={{ animationDelay: coin.delay, animationDuration: coin.duration }}
        >
          <coin.Icon className="h-1/2 w-1/2" strokeWidth={2.25} />
        </span>
      ))}
    </div>
  )
}
