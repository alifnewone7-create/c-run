import type { Metadata } from 'next'
import { AuthCard, AuthLayout } from '@/components/auth-card'
import { AuthRedirect } from '@/components/auth-redirect'

export const metadata: Metadata = {
  title: 'Registration | Coco AI',
  description:
    'Create your Coco AI account and let an autonomous engine read the market while you take the trade.',
  openGraph: {
    title: 'Create your Coco AI account',
    description:
      'Register for Coco AI and let an autonomous engine read the market while you take the trade.',
    images: ['/coco-ai.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create your Coco AI account',
    description:
      'Register for Coco AI and let an autonomous engine read the market while you take the trade.',
    images: ['/coco-ai.jpg'],
  },
}

export default function RegistrationPage() {
  return (
    <AuthRedirect>
      <AuthLayout>
        <AuthCard mode="registration" />
      </AuthLayout>
    </AuthRedirect>
  )
}
