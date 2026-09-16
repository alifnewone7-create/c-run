import type { Metadata } from 'next'
import { AnalyzerView } from '@/components/analyzer-view'

export const metadata: Metadata = {
  title: 'OTC Chart Analyzer | Sweetex AI',
  description:
    'Upload a Quotex OTC chart screenshot and get an AI reverse-logic 1-minute bias based on candle pattern, trend shift, and support/resistance.',
}

export default function OtcChartAnalyzerPage() {
  return <AnalyzerView mode="otc" />
}
