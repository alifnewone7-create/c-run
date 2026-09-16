import type { Metadata } from 'next'
import { NewsSignalsView } from '@/components/news-signals-view'

export const metadata: Metadata = {
  title: 'News Signals | Sweetex AI',
  description: "Live economic calendar with today's forex events and AI fundamental bias.",
}

export default function NewsSignalsPage() {
  return <NewsSignalsView />
}
