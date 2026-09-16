'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Scan, RefreshCw, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnalyzeFlow } from '@/components/analyze-flow'
import { AnalysisResultCard, type AnalysisResult } from '@/components/analysis-result'
import { cn } from '@/lib/utils'
import { useGatedAction } from '@/hooks/use-gated-action'

type AnalyzerMode = 'otc' | 'real'

type Popup = {
  kind: 'not-otc' | 'is-otc' | 'not-chart'
  title: string
  message: string
}

const ANALYSIS_LINES = [
  'Linking neural core',
  'Reading candle structure',
  'Mapping trend & pressure',
  'Scanning key levels',
  'Locking 1-min bias',
]

const ANALYSIS_CACHE_PREFIX = 'sweetex:chart-analysis:v1'

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Unable to read this image.'))
    reader.readAsDataURL(file)
  })
}

async function fingerprintImage(file: File) {
  try {
    const bytes = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('')
  } catch {
    return null
  }
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AnalysisResult>
  return Boolean(
    candidate.validation &&
      typeof candidate.validation.isValidChart === 'boolean' &&
      typeof candidate.validation.isOtc === 'boolean' &&
      candidate.description &&
      candidate.analysis &&
      typeof candidate.analysis.signal === 'string' &&
      typeof candidate.analysis.confidence === 'number',
  )
}

function getCachedAnalysis(key: string) {
  try {
    const cached = window.localStorage.getItem(key)
    if (!cached) return null
    const parsed: unknown = JSON.parse(cached)
    return isAnalysisResult(parsed) ? parsed : null
  } catch {
    return null
  }
}

function cacheAnalysis(key: string, result: AnalysisResult) {
  try {
    window.localStorage.setItem(key, JSON.stringify(result))
  } catch {
    // Storage can be unavailable or full; analysis should still work normally.
  }
}

export function ChartAnalyzer({ mode }: { mode: AnalyzerMode }) {
  const feature = mode === 'real' ? 'real-chart-analyzer' : 'otc-chart-analyzer'
  const { preflight, handleServerGate } = useGatedAction(feature)
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [popup, setPopup] = useState<Popup | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    setError('')
    setResult(null)
    setFingerprint(null)

    try {
      const [image, imageFingerprint] = await Promise.all([
        readImage(file),
        fingerprintImage(file),
      ])
      setPreview(image)
      setFingerprint(imageFingerprint)
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : 'Unable to read this image.')
    }
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function onPaste(e: React.ClipboardEvent) {
    const file = e.clipboardData.files?.[0]
    if (file) handleFile(file)
  }

  function reset() {
    setPreview(null)
    setFingerprint(null)
    setResult(null)
    setError('')
    setPopup(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function analyze() {
    if (!preview || loading) return

    // Client preflight (access + remaining credits). Server still enforces.
    const gate = await preflight()
    if (!gate.allowed) return

    setLoading(true)
    setError('')
    setResult(null)
    setPopup(null)
    try {
      const cacheKey = fingerprint
        ? `${ANALYSIS_CACHE_PREFIX}:${mode}:${fingerprint}`
        : null
      let data = cacheKey ? getCachedAnalysis(cacheKey) : null

      if (!data) {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${gate.token}`,
          },
          body: JSON.stringify({ image: preview, mode }),
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          // Access / limit errors open the upgrade modal instead of a raw error.
          if (handleServerGate(res.status, errorData)) {
            return
          }
          throw new Error(errorData.error || 'Analysis failed.')
        }

        const responseData: unknown = await res.json()
        if (!isAnalysisResult(responseData)) {
          throw new Error('The analyzer returned an invalid response.')
        }
        data = responseData
        if (cacheKey) cacheAnalysis(cacheKey, data)
      }

      // Gate 1: must be a real candlestick chart screenshot
      if (!data.validation?.isValidChart) {
        setPopup({
          kind: 'not-chart',
          title: 'Not a valid chart',
          message:
            'This does not look like a trading chart. Please upload a proper candlestick chart screenshot to run the analysis.',
        })
        return
      }

      // Gate 2 (OTC mode only): market must be an OTC pair
      if (mode === 'otc' && !data.validation?.isOtc) {
        setPopup({
          kind: 'not-otc',
          title: 'This is not an OTC market',
          message: `The detected pair "${data.description?.pair || 'Unknown'}" is not an OTC market. Upload a Quotex OTC chart (for example USD/BRL (OTC)) to get a signal.`,
        })
        return
      }

      // Gate 3 (Real mode only): market must NOT be an OTC pair
      if (mode === 'real' && data.validation?.isOtc) {
        setPopup({
          kind: 'is-otc',
          title: 'This is an OTC market',
          message: `The detected pair "${data.description?.pair || 'Unknown'}" is an OTC market. Upload a real market chart (for example EUR/USD or GBP/USD) to get a signal.`,
        })
        return
      }

      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Result view fully replaces the upload card once ready */}
      {result ? (
        <div className="flex flex-col gap-6">
          <AnalysisResultCard result={result} />
          <Button
            onClick={reset}
            data-testid="analyze-another-btn"
            className="btn-luxe h-12 w-full gap-2 rounded-xl text-[15px] font-bold sm:h-14 sm:rounded-2xl sm:text-base"
          >
            <RefreshCw className="refresh-spin h-4 w-4 sm:h-5 sm:w-5" />
            Analyze another chart
          </Button>
        </div>
      ) : !preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onPaste={onPaste}
          className={cn('coco-drop', dragging && 'is-dragging')}
          data-testid="analyzer-dropzone"
        >
          <span className="coco-drop-sheen" aria-hidden="true" />
          <span className="coco-drop-grid" aria-hidden="true" />

          <span className="coco-drop-term">
            <span
              className="coco-drop-term-dot bg-gradient-to-br from-destructive to-[var(--gold)]"
              aria-hidden="true"
            />
            <span
              className="coco-drop-term-dot bg-gradient-to-br from-[var(--gold)] to-up"
              aria-hidden="true"
            />
            <span
              className="coco-drop-term-dot bg-gradient-to-br from-up to-accent"
              aria-hidden="true"
            />
            <span className="coco-drop-term-label">
              <Cpu className="h-3.5 w-3.5 shrink-0 text-accent" />
              coco@ai ~ {mode === 'real' ? 'real-chart' : 'otc-chart'}
            </span>
          </span>

          <span className="coco-drop-body">
            <span className="coco-drop-core">
              <span className="coco-drop-ring" aria-hidden="true" />
              <span className="coco-drop-ring coco-drop-ring--slow" aria-hidden="true" />
              <span className="coco-drop-core-tile">
                <Upload className="h-6 w-6" />
              </span>
            </span>

            <span className="coco-drop-title">
              {dragging ? 'Release to load the chart' : 'Drop your chart to begin'}
            </span>
            <span className="coco-drop-sub">
              Tap to browse, drag &amp; drop, or paste a screenshot of your chart.
            </span>

            <span className="coco-drop-cta">
              <Scan className="h-4 w-4" />
              Select screenshot
            </span>
          </span>
        </button>
      ) : (
        <section className="border-luxe surface-luxe card-corner-glow relative overflow-hidden rounded-3xl">
          {/* Terminal-style header, flush with the top of the card */}
          <div className="relative z-10 flex items-center gap-2 border-b border-[oklch(0.7_0.16_255_/_0.55)] px-5 py-3 sm:px-6">
            {mode === 'real' ? (
              <>
                <span
                  className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-up to-accent shadow-[0_0_8px_-1px] shadow-up/60"
                  style={{ animationDuration: '1.8s', animationDelay: '0s' }}
                />
                <span
                  className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-accent to-primary shadow-[0_0_8px_-1px] shadow-accent/60"
                  style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}
                />
                <span
                  className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-primary to-[var(--gold)] shadow-[0_0_8px_-1px] shadow-primary/60"
                  style={{ animationDuration: '1.8s', animationDelay: '0.6s' }}
                />
              </>
            ) : (
              <>
                <span
                  className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-destructive to-[var(--gold)] shadow-[0_0_8px_-1px] shadow-destructive/60"
                  style={{ animationDuration: '1.8s', animationDelay: '0s' }}
                />
                <span
                  className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-[var(--gold)] to-up shadow-[0_0_8px_-1px] shadow-[var(--gold)]/60"
                  style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}
                />
                <span
                  className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-up to-accent shadow-[0_0_8px_-1px] shadow-up/60"
                  style={{ animationDuration: '1.8s', animationDelay: '0.6s' }}
                />
              </>
            )}
            <span className="ml-2 flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="truncate whitespace-nowrap">
                coco@ai — {mode === 'real' ? 'Real Chart Analyzer' : 'Otc Chart Analyzer'}
              </span>
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-6">
            {/* Preview + analyzing overlay */}
            {preview && (
              <>
                <div className="border-luxe relative overflow-hidden rounded-2xl bg-input/20">
                  <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-lg bg-background/60 px-2.5 py-1 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                      Chart Feed
                    </span>
                  </div>
                  <div className="flex max-h-[52vh] w-full items-center justify-center overflow-hidden sm:max-h-[58vh]">
                    <Image
                      src={preview}
                      alt="Uploaded chart preview"
                      width={1280}
                      height={720}
                      unoptimized
                      className="h-auto max-h-[52vh] w-full object-contain sm:max-h-[58vh]"
                    />
                  </div>
                  {loading && <AnalyzingOverlay />}
                </div>

                {!loading && (
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                    <Button
                      onClick={analyze}
                      data-testid="analyze-chart-btn"
                      className="btn-luxe h-12 w-full gap-2 rounded-xl text-[15px] font-bold sm:h-14 sm:flex-1 sm:rounded-2xl sm:text-base"
                    >
                      <Scan className="h-4 w-4 sm:h-5 sm:w-5" />
                      Analyze Chart
                    </Button>
                    <Button
                      onClick={reset}
                      data-testid="clear-chart-btn"
                      className="btn-luxe-outline h-11 w-full gap-2 rounded-xl px-5 text-sm font-semibold sm:h-14 sm:w-auto sm:flex-none sm:rounded-2xl sm:text-base"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                )}
              </>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {error}
              </p>
            )}
          </div>
        </section>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {popup && <RejectPopup popup={popup} onClose={() => setPopup(null)} />}
    </div>
  )
}

function AnalyzingOverlay() {
  const [line, setLine] = useState(0)

  useEffect(() => {
    setLine(0)
    const total = 9000
    const step = total / (ANALYSIS_LINES.length + 1)
    const timers = ANALYSIS_LINES.map((_, i) =>
      setTimeout(() => setLine(i + 1), step * (i + 1)),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/75 px-4 backdrop-blur-sm sm:gap-5 sm:px-6">
      {/* wired engine flow — nodes light up as each analysis stage completes */}
      <AnalyzeFlow stage={line} />

      <div className="flex items-center gap-2 font-mono text-xs text-accent sm:text-sm">
        <Cpu className="h-3.5 w-3.5" />
        <span className="animate-pulse">
          {ANALYSIS_LINES[Math.min(line, ANALYSIS_LINES.length - 1)]}…
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {ANALYSIS_LINES.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i < line ? 'w-6 bg-accent' : 'w-1.5 bg-border',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function RejectPopup({
  popup,
  onClose,
}: {
  popup: Popup
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const isOtc = popup.kind === 'not-otc'
  const Icon = isOtc ? ShieldAlert : AlertTriangle

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 animate-in fade-in bg-background/70 backdrop-blur-sm duration-200"
        onClick={onClose}
      />
      <div className="border-luxe surface-luxe card-corner-glow animate-in fade-in zoom-in-95 slide-in-from-bottom-2 relative z-10 w-full max-w-sm overflow-hidden rounded-3xl duration-300">
        <div className="relative z-10 flex flex-col items-center gap-4 p-6 text-center">
          <span
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl',
              isOtc
                ? 'bg-destructive/15 text-destructive'
                : 'bg-gold/15 text-gold',
            )}
          >
            <Icon className="icon-pulse-soft h-8 w-8" />
          </span>
          <h2
            id="popup-title"
            className="text-balance text-xl font-bold tracking-tight"
          >
            {popup.title}
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {popup.message}
          </p>
          <Button
            onClick={onClose}
            className="btn-luxe mt-1 h-12 w-full rounded-2xl text-base font-semibold"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}
