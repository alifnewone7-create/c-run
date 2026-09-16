import type { Metadata } from 'next'
import { FutureSignalsView } from '@/components/future-signals-view'

export const metadata: Metadata = {
  title: 'Future Signals | Coco AI',
  description:
    'AI-powered future trading signals. Select OTC or real markets and forecast a queue of upcoming 1-minute entries.',
}

export default function FutureSignalsPage() {
  return <FutureSignalsView />
}
