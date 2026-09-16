import type { Metadata } from 'next'
import { AuthCard, AuthLayout } from '@/components/auth-card'
import { AuthRedirect } from '@/components/auth-redirect'

export const metadata: Metadata = {
  title: 'Login | Coco AI',
  description:
    'Sign in to your Coco AI account and reach your autonomous trading console with live, data driven signals.',
  openGraph: {
    title: 'Login | Coco AI',
    description:
      'Sign in to Coco AI and reach your autonomous trading console with live, data driven signals.',
    images: ['/coco-ai.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login | Coco AI',
    description:
      'Sign in to Coco AI and reach your autonomous trading console with live, data driven signals.',
    images: ['/coco-ai.jpg'],
  },
}

export default function LoginPage() {
  return (
    <AuthRedirect>
      <AuthLayout>
        <AuthCard mode="login" />
      </AuthLayout>
    </AuthRedirect>
  )
}
