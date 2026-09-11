'use client'

import { useState, useRef } from 'react'
import type { InputMode } from '@/types'

interface Props {
  onExtract: (transcript: string) => void
}

const TABS: { id: InputMode; label: string }[] = [
  { id: 'text', label: 'Pegar texto' },
  { id: 'file', label: 'Subir archivo' },
  { id: 'gdocs', label: 'Google Docs' },
]

export default function PantallaIngreso({ onExtract }: Props) {
  const [mode, setMode] = useState<InputMode>('text')
  const [textValue, setTextValue] = useState('')
  const [gdocsUrl, setGdocsUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    setError(null)

    if (mode === 'text') {
      if (!textValue.trim()) { setError('Falta transcripción. Por favor pega el texto de la reunión.'); return }
      onExtract(textValue.trim())
      return
    }

    if (mode === 'gdocs') {
      if (!gdocsUrl.trim()) { setError('Por favor ingresa el link de Google Docs.'); return }
      if (!gdocsUrl.includes('docs.google.com/document/d/')) {
        setError('El link no parece ser de Google Docs. Verifica la URL.'); return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: gdocsUrl }),
        })
        const data = await res.json() as { text?: string; error?: string }
        if (!res.ok) { setError(data.error ?? 'Error al acceder al documento'); return }
        onExtract(data.text!)
      } catch { setError('No pudimos acceder al documento. Verifica el link.') }
      finally { setLoading(false) }
      return
    }

    if (mode === 'file') {
      if (!file) { setError('Por favor selecciona un archivo.'); return }
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/parse', { method: 'POST', body: formData })
        const data = await res.json() as { text?: string; error?: string }
        if (!res.ok) { setError(data.error ?? 'Error al leer el archivo'); return }
        onExtract(data.text!)
      } catch { setError('Error al procesar el archivo. Intenta de nuevo.') }
      finally { setLoading(false) }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-adipa-lavender p-6">
      <h2 className="text-base font-semibold text-adipa-navy mb-1">Ingresa la transcripción</h2>
      <p className="text-sm text-slate-500 mb-5">
        Pega el texto, sube un archivo o enlaza un Google Docs.
      </p>

      {/* Tabs */}
      <div className="flex border-b border-adipa-lavender mb-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setMode(tab.id); setError(null) }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              mode === tab.id
                ? 'border-adipa-purple text-adipa-purple'
                : 'border-transparent text-slate-400 hover:text-adipa-navy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pegar texto */}
      {mode === 'text' && (
        <textarea
          value={textValue}
          onChange={e => setTextValue(e.target.value)}
          placeholder="Pega aquí el texto crudo de la transcripción de la reunión..."
          className="w-full h-52 resize-none rounded-xl border border-adipa-lavender p-3 text-sm text-adipa-navy placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-adipa-purple/40 focus:border-adipa-purple leading-relaxed transition-colors"
        />
      )}

      {/* Subir archivo */}
      {mode === 'file' && (
        <>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              file
                ? 'border-adipa-purple bg-adipa-light'
                : 'border-adipa-lavender hover:border-adipa-purple/50 hover:bg-adipa-light'
            }`}
          >
            {file ? (
              <div>
                <p className="text-sm font-semibold text-adipa-purple">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {(file.size / 1024).toFixed(1)} KB · Haz clic para cambiar
                </p>
              </div>
            ) : (
              <div>
                <svg className="w-8 h-8 text-adipa-lavender mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-sm text-slate-500">
                  Arrastra un archivo o{' '}
                  <span className="text-adipa-purple font-semibold">haz clic para seleccionar</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">.txt · .docx · .pdf · .md</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.docx,.pdf,.md"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setFile(f); setError(null) }
            }}
          />
        </>
      )}

      {/* Google Docs */}
      {mode === 'gdocs' && (
        <div>
          <input
            type="url"
            value={gdocsUrl}
            onChange={e => setGdocsUrl(e.target.value)}
            placeholder="https://docs.google.com/document/d/..."
            className="w-full rounded-xl border border-adipa-lavender p-3 text-sm text-adipa-navy placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-adipa-purple/40 focus:border-adipa-purple transition-colors"
          />
          <p className="text-xs text-slate-400 mt-2">
            El documento debe estar configurado como &quot;cualquiera con el link puede ver&quot;.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Botón */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-5 w-full py-3 rounded-xl gradient-adipa-r text-white font-semibold text-sm hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#704EFD]/25"
      >
        {loading ? 'Preparando...' : 'Extraer Insights'}
      </button>
    </div>
  )
}
