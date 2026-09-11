import { NextRequest, NextResponse } from 'next/server'
import { extractInsights } from '@/lib/gemini'

const MOCK_INSIGHTS = {
  objeciones: [
    'El precio actual está por encima del presupuesto aprobado para este trimestre',
    'No están seguros de que la integración con su sistema actual sea compatible',
    'El equipo técnico necesita más tiempo para evaluar la seguridad de los datos',
  ],
  requerimientos: [
    'Necesitan un módulo de reportes exportable a Excel',
    'Requieren soporte en español disponible 24/7',
    'Solicitan una prueba gratuita de 30 días antes de comprometerse',
  ],
  vocabulario: [
    '"Pipeline de ventas" — así llaman a su proceso comercial interno',
    '"Ticketera" — el sistema de soporte que usan actualmente',
    '"Cierre rápido" — cuando logran cerrar un trato en menos de una semana',
  ],
}

const IS_DEMO = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder'

export async function POST(req: NextRequest) {
  const { transcript } = (await req.json()) as { transcript: string }

  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'Falta transcripción' }, { status: 400 })
  }

  // Modo demo: devuelve datos ficticios sin llamar a la IA
  if (IS_DEMO) {
    await new Promise(r => setTimeout(r, 2500)) // simula tiempo de respuesta real
    return NextResponse.json(MOCK_INSIGHTS)
  }

  try {
    const insights = await extractInsights(transcript)
    return NextResponse.json(insights)
  } catch (err) {
    console.error('[extract]', err)
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
