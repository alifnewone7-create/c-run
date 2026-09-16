import Link from 'next/link'
import Image from 'next/image'
import { MoveLeft, Compass } from 'lucide-react'
import { CocoHeroBg } from '@/components/coco/coco-hero-bg'

export default function NotFound() {
  return (
    <div className="coco coco-dark relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-20">
      <CocoHeroBg />

      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="relative h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-white/20">
          <Image src="/coco-profile.png" alt="Coco AI" fill sizes="64px" className="object-cover" />
        </span>

        <span className="coco-eyebrow mt-6">
          <Compass className="h-3 w-3" />
          Lost window
        </span>

        <h1 className="coco-display coco-title-gradient mt-5 text-[3.4rem] leading-none sm:text-[4.6rem]">
          404
        </h1>

        <p className="coco-sub mt-3 text-lg text-white sm:text-xl">This page is off the tape.</p>

        <p className="mx-auto mt-3 max-w-[46ch] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
          The page you are looking for has moved or never existed. Head back to the console and pick
          up where you left off.
        </p>

        <Link href="/" className="coco-btn coco-btn-primary mt-8" data-testid="notfound-home-btn">
          <MoveLeft className="h-4 w-4" />
          Back to Coco AI
        </Link>
      </div>
    </div>
  )
}
