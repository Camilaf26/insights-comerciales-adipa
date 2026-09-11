'use client'

interface Props {
  progress: number
  error: string | null
  onRetry: () => void
}

export default function PantallaCarga({ progress, error, onRetry }: Props) {
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-adipa-lavender p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-adipa-navy mb-2">Ocurrió un error</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl gradient-adipa-r text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-[#704EFD]/25"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-adipa-lavender p-8 text-center">
      {/* Spinner con colores de marca */}
      <div
        className="w-12 h-12 rounded-full mx-auto mb-5 animate-spin"
        style={{ border: '4px solid #DFD5FF', borderTopColor: '#704EFD' }}
      />

      <h2 className="text-base font-semibold text-adipa-navy mb-1">Procesando con IA</h2>
      <p className="text-sm text-slate-500 mb-7">
        Analizando la transcripción y extrayendo insights...
      </p>

      {/* Barra con gradiente de marca */}
      <div className="w-full bg-adipa-light rounded-full h-1.5 mb-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(to right, #704EFD, #2CB7FF)',
          }}
        />
      </div>
      <p className="text-xs text-slate-400 tabular-nums">{progress}%</p>
    </div>
  )
}
