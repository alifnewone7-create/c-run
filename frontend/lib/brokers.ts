// Broker selection shared by the analyzer sheet and the analyzer pages.

export type BrokerId = 'binolla' | 'quotex' | 'pocketoption'

export type Broker = {
  id: BrokerId
  name: string
  logo: string
  /** vertical lift (px) used by the arc card layout */
  lift: number
  tilt: number
  accent: string
}

/* Arc order: left → Binolla, middle → Quotex, right → Pocket Option */
export const BROKERS: Broker[] = [
  {
    id: 'binolla',
    name: 'Binolla',
    logo: '/broker-binolla.png',
    lift: 0,
    tilt: -7,
    accent: '#b3082f',
  },
  {
    id: 'quotex',
    name: 'Quotex',
    logo: '/broker-quotex.png',
    lift: -26,
    tilt: 0,
    accent: '#2f5ce0',
  },
  {
    id: 'pocketoption',
    name: 'Pocket Option',
    logo: '/broker-pocketoption.png',
    lift: 0,
    tilt: 7,
    accent: '#2f7ae0',
  },
]

export const BROKER_STORAGE_KEY = 'coco:broker'

export function getBroker(id: unknown): Broker | null {
  return BROKERS.find((b) => b.id === id) || null
}

export function readStoredBroker(): Broker | null {
  if (typeof window === 'undefined') return null
  try {
    return getBroker(window.localStorage.getItem(BROKER_STORAGE_KEY))
  } catch {
    return null
  }
}

export function storeBroker(id: BrokerId) {
  try {
    window.localStorage.setItem(BROKER_STORAGE_KEY, id)
    window.dispatchEvent(new CustomEvent('coco:broker-change', { detail: id }))
  } catch {
    /* storage unavailable */
  }
}
