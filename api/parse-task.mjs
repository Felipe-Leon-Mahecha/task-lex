const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-3.5-flash'

const SYSTEM_PROMPT = `Eres Fox, un asistente inteligente de la app Flux.
Tu ÚNICO trabajo es extraer tareas de frases en lenguaje natural y devolver JSON estructurado.

REGLAS:
- Si el usuario no describe una tarea clara, igualmente extrae lo más cercano a una tarea
- FECHAS: Convierte fechas relativas ("mañana", "el lunes", "en 3 días") a ISO 8601. Si no hay fecha, usa null
- HORA: Si mencionan hora, inclúyela en la fecha ISO. Si no, usa medianoche
- PRIORIDAD: "alta" si hay urgencia explícita o deadlines, "baja" si es casual, "media" por defecto
- TAGS: Extrae categorías relevantes del contexto (ej: "compras", "trabajo", "casa")
- IDIOMA: El usuario habla español. title y description en español
- TITLE: Sé conciso pero descriptivo (máx 80 caracteres)
- DESCRIPTION: Breve contexto adicional si es útil, si no string vacío`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured' })
  }

  const { prompt } = req.body ?? {}
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'prompt is required' })
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              dueDate: { type: 'string', nullable: true },
              priority: { type: 'string', enum: ['baja', 'media', 'alta'] },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'description', 'priority', 'tags'],
          },
          temperature: 0.2,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', response.status, err)
      return res.status(502).json({ error: `AI service error (${response.status})` })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return res.status(502).json({ error: 'Empty AI response' })
    }

    const parsed = JSON.parse(text)
    return res.status(200).json(parsed)
  } catch (e) {
    console.error('Parse task error:', e)
    return res.status(500).json({ error: 'Failed to parse task' })
  }
}
