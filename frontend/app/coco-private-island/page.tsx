import type { Metadata } from 'next'
import { AdminPortal } from '@/components/admin/admin-portal'

// Keep the hidden admin route out of search engines.
export const metadata: Metadata = {
  title: 'Portal',
  robots: { index: false, follow: false },
}

export default function SecretPortalPage() {
  return <AdminPortal />
}
