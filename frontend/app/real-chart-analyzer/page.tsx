import type { Metadata } from 'next'
import { AnalyzerView } from '@/components/analyzer-view'

export const metadata: Metadata = {
  title: 'Real Chart Analyzer | Sweetex AI',
  description:
    'Upload a real market chart screenshot and get a direct AI 1-minute trade signal based on candle pattern, trend shift, and support/resistance.',
}

export default function RealChartAnalyzerPage() {
  return <AnalyzerView mode="real" />
}
