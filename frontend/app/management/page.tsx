import type { Metadata } from 'next'
import { ManagementView } from '@/components/management-view'

export const metadata: Metadata = {
  title: 'Management | Sweetex AI',
  description: 'Compounding money-management planner with profit target, risk per trade and MTG.',
}

export default function ManagementPage() {
  return <ManagementView />
}
