import type { Metadata, Viewport } from 'next'
import {
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Playfair_Display,
  Sora,
} from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { UpgradeGateProvider } from '@/components/upgrade-gate'
import './globals.css'
import './coco.css'
import './analysis-result.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})
const schibsted = Sora({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})
const schibstedBody = Sora({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})
const techMono = JetBrains_Mono({
  variable: '--font-tech',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coco.ai'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Coco AI | Autonomous Trading Intelligence',
  description:
    'Coco AI is an autonomous trading engine that reads the market in real time and delivers precise, data driven signals. Start free or activate a direct license today.',
  generator: 'iamhear',
  icons: {
    icon: '/coco-ai.jpg',
    apple: '/coco-ai.jpg',
  },
  openGraph: {
    title: 'Coco AI | Autonomous Trading Intelligence',
    description:
      'Real time market scanning, AI verified entries and 24/7 signals | trade with a machine that never blinks.',
    images: ['/coco-ai.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coco AI | Autonomous Trading Intelligence',
    description:
      'Real time market scanning, AI verified entries and 24/7 signals | trade with a machine that never blinks.',
    images: ['/coco-ai.jpg'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0618',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${schibsted.variable} ${schibstedBody.variable} ${techMono.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        <AuthProvider>
          <UpgradeGateProvider>{children}</UpgradeGateProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
