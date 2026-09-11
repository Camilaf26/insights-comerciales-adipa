import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''

  // ── Google Docs URL ──────────────────────────────────────────────
  if (contentType.includes('application/json')) {
    const { url } = (await req.json()) as { url: string }

    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
    if (!match) {
      return NextResponse.json({ error: 'URL de Google Docs inválida' }, { status: 400 })
    }

    const exportUrl = `https://docs.google.com/document/d/${match[1]}/export?format=txt`
    try {
      const gdRes = await fetch(exportUrl)
      if (!gdRes.ok) {
        return NextResponse.json(
          { error: 'No pudimos acceder al documento. Verifica que el link sea correcto y que el documento sea público o compartido.' },
          { status: 400 }
        )
      }
      const text = await gdRes.text()
      return NextResponse.json({ text })
    } catch {
      return NextResponse.json(
        { error: 'No pudimos acceder al documento. Verifica que el link sea correcto y que el documento sea público o compartido.' },
        { status: 400 }
      )
    }
  }

  // ── Archivo subido ───────────────────────────────────────────────
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['txt', 'md', 'docx', 'pdf'].includes(ext)) {
    return NextResponse.json(
      { error: 'Formato no compatible. Usa .txt, .docx, .pdf o .md.' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    let text = ''

    if (ext === 'txt' || ext === 'md') {
      text = buffer.toString('utf-8')
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (ext === 'pdf') {
      // Importar desde lib directa para evitar el problema del archivo de test de pdf-parse
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse/lib/pdf-parse.js')
      const result = await pdfParse(buffer)
      text = result.text as string
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'El archivo parece estar vacío o no tiene texto legible.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('[parse]', err)
    return NextResponse.json(
      { error: 'Error al leer el archivo. Intenta con otro formato.' },
      { status: 500 }
    )
  }
}
