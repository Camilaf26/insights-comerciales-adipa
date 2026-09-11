'use client'

import { useState } from 'react'
import type { Insights } from '@/types'

interface Props {
  insights: Insights
  onApprove: () => void
  onRetry: () => void
}

const DEFAULT_MSG = 'No hubieron objeciones ni observaciones en relación a este punto en la reunión.'

const CATEGORIES = [
  {
    key: 'objeciones' as const,
    label: 'Objeciones de ventas',
    borderColor: 'border-l-[#704EFD]',
    dotColor: 'bg-[#704EFD]',
    hint: 'Razones por las que el cliente duda o frena la decisión.',
  },
  {
    key: 'requerimientos' as const,
    label: 'Requerimientos de producto',
    borderColor: 'border-l-[#2CB7FF]',
    dotColor: 'bg-[#2CB7FF]',
    hint: 'Funcionalidades o necesidades que el cliente pidió.',
  },
  {
    key: 'vocabulario' as const,
    label: 'Vocabulario del cliente',
    borderColor: 'border-l-[#091E42]',
    dotColor: 'bg-[#091E42]',
    hint: 'Términos y frases que usa el cliente para describir su contexto.',
  },
]

function formatItems(items: string[]): string {
  if (items.length === 0) return DEFAULT_MSG
  return items.map(i => `• ${i}`).join('\n')
}

export default function PantallaRevision({ insights, onApprove, onRetry }: Props) {
  const [values, setValues] = useState({
    objeciones: formatItems(insights.objeciones),
    requerimientos: formatItems(insights.requerimientos),
    vocabulario: formatItems(insights.vocabulario),
  })
  const [error, setError] = useState<string | null>(null)

  const updateField = (key: keyof typeof values, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
    setError(null)
  }

  const handleApprove = () => {
    const isEmpty = (text: string) => !text.trim() || text.trim() === DEFAULT_MSG
    if (isEmpty(values.objeciones) && isEmpty(values.requerimientos) && isEmpty(values.vocabulario)) {
      setError('Al menos una categoría debe tener contenido para aprobar.')
      return
    }
    onApprove()
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl shadow-sm border border-adipa-lavender px-6 py-5">
        <h2 className="text-base font-semibold text-adipa-navy">Revisa y edita los resultados</h2>
        <p className="text-sm text-slate-500 mt-1">
          La IA extrajo los siguientes insights. Puedes editarlos antes de aprobar.
        </p>
      </div>

      {/* Categorías */}
      {CATEGORIES.map(cat => (
        <div
          key={cat.key}
          className={`bg-white rounded-2xl shadow-sm border border-adipa-lavender border-l-4 ${cat.borderColor} px-6 py-5`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
            <h3 className="text-sm font-semibold text-adipa-navy">{cat.label}</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">{cat.hint}</p>
          <textarea
            value={values[cat.key]}
            onChange={e => updateField(cat.key, e.target.value)}
            className="w-full h-28 resize-y rounded-xl border border-adipa-lavender p-3 text-sm text-adipa-navy placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-adipa-purple/40 focus:border-adipa-purple leading-relaxed transition-colors"
          />
        </div>
      ))}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl border border-adipa-lavender text-adipa-purple font-medium text-sm hover:bg-adipa-light transition-colors"
        >
          Reintentar
        </button>
        <button
          onClick={handleApprove}
          className="flex-1 py-3 rounded-xl gradient-adipa-r text-white font-semibold text-sm hover:opacity-90 active:opacity-80 transition-opacity shadow-md shadow-[#704EFD]/25"
        >
          Aprobar y enviar
        </button>
      </div>
    </div>
  )
}
