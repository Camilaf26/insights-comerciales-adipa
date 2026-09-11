'use client'

import { useState, useRef } from 'react'
import PantallaIngreso from '@/components/PantallaIngreso'
import PantallaCarga from '@/components/PantallaCarga'
import PantallaRevision from '@/components/PantallaRevision'
import PantallaExito from '@/components/PantallaExito'
import type { Insights, Screen } from '@/types'

const STEPS: Screen[] = ['ingreso', 'carga', 'revision', 'exito']
const STEP_LABELS: Record<Screen, string> = {
  ingreso: 'Ingreso',
  carga: 'Procesando',
  revision: 'Revisión',
  exito: 'Listo',
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('ingreso')
  const [transcript, setTranscript] = useState('')
  const [insights, setInsights] = useState<Insights | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef(0)

  const stopSimulation = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  const startSimulation = () => {
    stopSimulation()
    progressRef.current = 0
    setProgress(0)
    intervalRef.current = setInterval(() => {
      const curr = progressRef.current
      if (curr >= 85) return
      const next = curr < 40 ? curr + 2 : curr + 0.4
      progressRef.current = Math.min(next, 85)
      setProgress(Math.round(progressRef.current))
    }, 100)
  }

  const handleExtract = async (text: string) => {
    setTranscript(text)
    setError(null)
    setScreen('carga')
    startSimulation()

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar con la IA')

      stopSimulation()
      setProgress(100)
      setTimeout(() => {
        setInsights(data as Insights)
        setScreen('revision')
        setProgress(0)
      }, 500)
    } catch (err) {
      stopSimulation()
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al procesar la transcripción. Por favor, inténtalo nuevamente.'
      )
    }
  }

  const handleRetry = () => { setError(null); handleExtract(transcript) }
  const handleApprove = () => setScreen('exito')
  const handleReset = () => {
    setScreen('ingreso'); setTranscript(''); setInsights(null); setError(null); setProgress(0)
  }

  const currentStepIndex = STEPS.indexOf(screen)

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl">

        {/* Cabecera */}
        <div className="text-center mb-8">
          {/* Ícono con gradiente de marca */}
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl gradient-adipa mb-3 shadow-md shadow-[#704EFD]/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          {/* Marca */}
          <p className="text-xs font-semibold tracking-widest text-adipa-purple uppercase mb-1">ADIPA</p>
          <h1 className="text-xl font-semibold text-adipa-navy">Insights Comerciales</h1>
          <p className="text-sm text-slate-500 mt-1">Extrae objeciones, requerimientos y vocabulario de tus reuniones</p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < currentStepIndex
                    ? 'bg-adipa-purple opacity-40'
                    : i === currentStepIndex
                    ? 'bg-adipa-purple scale-125 shadow-sm shadow-[#704EFD]/50'
                    : 'bg-slate-200'
                }`} />
                <span className={`text-xs font-medium transition-colors ${
                  i === currentStepIndex ? 'text-adipa-purple' : 'text-slate-400'
                }`}>{STEP_LABELS[step]}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-px mx-2 mb-4 transition-colors ${
                  i < currentStepIndex ? 'bg-adipa-lavender' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Pantallas */}
        {screen === 'ingreso' && <PantallaIngreso onExtract={handleExtract} />}
        {screen === 'carga'   && <PantallaCarga progress={progress} error={error} onRetry={handleRetry} />}
        {screen === 'revision' && insights && (
          <PantallaRevision
            key={JSON.stringify(insights)}
            insights={insights}
            onApprove={handleApprove}
            onRetry={handleRetry}
          />
        )}
        {screen === 'exito' && <PantallaExito onReset={handleReset} />}
      </div>
    </main>
  )
}
