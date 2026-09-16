'use client'

import { useEffect, useState } from 'react'
import { Workflow, BrainCircuit, Cpu } from 'lucide-react'

export function AiEngineCard() {
  const [accuracy, setAccuracy] = useState(98.6)

  useEffect(() => {
    const acc = setInterval(() => {
      setAccuracy(() => 97.5 + Math.random() * 2.2)
    }, 1600)
    return () => {
      clearInterval(acc)
    }
  }, [])

  return (
    <div className="border-luxe surface-luxe relative overflow-hidden rounded-3xl p-5 shadow-2xl shadow-primary/15 sm:p-6">
      {/* glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

      {/* header row */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
            <BrainCircuit className="icon-pulse-soft h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Sweetex AI Engine</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--up)]" />
              Live · scanning markets
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-base font-bold tabular-nums sm:text-lg">
            {accuracy.toFixed(1)}%
          </p>
          <p className="text-xs font-medium text-muted-foreground">signal accuracy</p>
        </div>
      </div>

      {/* AI engine 3D cube */}
      <div className="relative mx-auto my-10 flex h-40 w-40 items-center justify-center text-center sm:h-48 sm:w-48">
        <div className="cube-scene flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          <div
            className="cube"
            style={{ ['--cube-size' as string]: '120px', ['--cube-half' as string]: '60px' }}
          >
            <div className="cube__face cube__face--front">
              <Cpu strokeWidth={1.5} />
            </div>
            <div className="cube__face cube__face--back">
              <Cpu strokeWidth={1.5} />
            </div>
            <div className="cube__face cube__face--right">
              <Cpu strokeWidth={1.5} />
            </div>
            <div className="cube__face cube__face--left">
              <Cpu strokeWidth={1.5} />
            </div>
            <div className="cube__face cube__face--top">
              <Cpu strokeWidth={1.5} />
            </div>
            <div className="cube__face cube__face--bottom">
              <Cpu strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Workflow className="icon-pulse-soft h-3.5 w-3.5 text-accent" />
        Powered by Sweetex AI real-time algorithm
      </div>
    </div>
  )
}
