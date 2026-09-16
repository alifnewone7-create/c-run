import type { Metadata } from 'next'
import { InjectorView } from '@/components/injector-view'

export const metadata: Metadata = {
  title: 'Coco Injector',
  description:
    'Pick a market, choose a 2 / 5 / 10 minute window and let Coco inject a directional signal with an exact entry time.',
  openGraph: {
    title: 'Coco Injector',
    description:
      'Pick a market, choose a 2 / 5 / 10 minute window and let Coco inject a directional signal with an exact entry time.',
    images: ['/coco-ai.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coco Injector',
    description:
      'Pick a market, choose a 2 / 5 / 10 minute window and let Coco inject a directional signal with an exact entry time.',
    images: ['/coco-ai.jpg'],
  },
}

export default function InjectorPage() {
  return <InjectorView />
}
