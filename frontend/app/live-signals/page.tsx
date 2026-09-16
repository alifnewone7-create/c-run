import type { Metadata } from 'next'
import { LiveSignalsView } from '@/components/live-signals-view'

export const metadata: Metadata = {
  title: 'Live Signals | Coco AI',
  description: 'Real-time AI-powered live trading signals.',
}

export default function LiveSignalsPage() {
  return <LiveSignalsView />
}
