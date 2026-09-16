import { flagUrl } from '@/lib/markets'
import { cn } from '@/lib/utils'

export function PairFlags({
  base,
  quote,
  size = 22,
  className,
}: {
  base: string
  quote: string
  size?: number
  className?: string
}) {
  const overlap = Math.round(size * 0.42)
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center', className)}
      style={{ width: size * 2 - overlap, height: size }}
      aria-hidden="true"
    >
      <img
        src={flagUrl(base)}
        alt=""
        loading="lazy"
        className="absolute left-0 rounded-full object-cover ring-2 ring-background"
        style={{ width: size, height: size }}
      />
      <img
        src={flagUrl(quote)}
        alt=""
        loading="lazy"
        className="absolute rounded-full object-cover ring-2 ring-background"
        style={{ width: size, height: size, left: size - overlap }}
      />
    </span>
  )
}
