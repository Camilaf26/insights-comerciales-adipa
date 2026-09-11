import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Insights } from '@/types'

const PROMPT = `Eres un asistente especializado en análisis de reuniones comerciales.
Recibirás la transcripción cruda de una reunión entre un vendedor y un cliente.

Tu tarea es extraer y clasificar la información en exactamente tres categorías.
Devuelve el resultado SOLO en formato JSON, sin texto adicional, con esta estructura:

{
  "objeciones": ["Objeción o duda expresada por el cliente que frena o complica la venta"],
  "requerimientos": ["Funcionalidad, característica o necesidad que el cliente pidió explícita o implícitamente"],
  "vocabulario": ["Término, frase o expresión específica que el cliente usó para describir su problema, contexto o industria"]
}

Reglas:
- Cada item debe ser una oración o frase corta y clara (máximo 2 líneas).
- Si no encuentras información relevante para una categoría, devuelve un array vacío [].
- No inventes información que no esté en la transcripción.
- No incluyas saludos, despedidas ni conversación de relleno.
- Responde ÚNICAMENTE con el JSON, sin markdown, sin bloques de código, sin texto adicional.

Transcripción:`

export async function extractInsights(transcript: string): Promise<Insights> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no está configurada en .env.local')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(`${PROMPT}\n\n${transcript}`)
  const raw = result.response.text()

  const cleaned = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  const parsed = JSON.parse(cleaned) as Insights
  return parsed
}
