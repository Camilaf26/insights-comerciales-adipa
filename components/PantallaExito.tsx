'use client'

interface Props {
  onReset: () => void
}

export default function PantallaExito({ onReset }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-adipa-lavender p-10 text-center">
      {/* Ícono de éxito con gradiente de marca */}
      <div className="w-14 h-14 rounded-full gradient-adipa flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#704EFD]/30">
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-adipa-navy mb-2">
        ¡Insights procesados exitosamente!
      </h2>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
        Los insights de esta reunión han sido revisados y aprobados.
      </p>

      <button
        onClick={onReset}
        className="px-6 py-3 rounded-xl gradient-adipa-r text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-[#704EFD]/25"
      >
        Procesar otra transcripción
      </button>
    </div>
  )
}
