import { createSign } from 'node:crypto'

const FOX_OWNER_EMAIL = 'fmleonm19@gmail.com'
const SA_PROJECT_ID = process.env.FIREBASE_PROJECT_ID
const SA_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL
const SA_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
const WEB_API_KEY = process.env.VITE_FIREBASE_API_KEY

let saToken = null
let saTokenExp = 0

async function getAccessToken() {
  if (saToken && saTokenExp > Date.now() + 60_000) return saToken
  const iat = Math.floor(Date.now() / 1000)
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: SA_CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 3600 })}`
  const sig = createSign('RSA-SHA256').update(unsigned).sign(SA_PRIVATE_KEY, 'base64url')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  })
  if (!res.ok) throw new Error(`oauth2 ${res.status}`)
  const data = await res.json()
  saToken = data.access_token
  saTokenExp = Date.now() + (data.expires_in ?? 3600) * 1000
  return saToken
}

async function lookupUser(idToken) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) return null
  const data = await res.json()
  const u = data?.users?.[0]
  if (!u) return null
  if (u.email === FOX_OWNER_EMAIL && u.emailVerified !== true) return null
  return u
}

async function isPremiumUser(uid) {
  if (!uid) return false
  try {
    const token = await getAccessToken()
    const url = `https://firestore.googleapis.com/v1/projects/${SA_PROJECT_ID}/databases/(default)/documents/users/${uid}/foxSkins/data`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return false
    const doc = await res.json()
    const f = doc.fields ?? {}
    if (f.premium?.booleanValue !== true) return false
    const until = Number(f.premiumUntil?.integerValue ?? f.premiumUntil?.stringValue ?? f.premiumUntil?.doubleValue ?? 0)
    return until === 0 || until > Date.now()
  } catch {
    return false
  }
}

async function canUseAI(req) {
  const header = req.headers.authorization ?? ''
  if (!header.startsWith('Bearer ')) return false
  try {
    const user = await lookupUser(header.slice(7))
    if (!user) return false
    if (user.email === FOX_OWNER_EMAIL && user.emailVerified === true) return true
    return await isPremiumUser(user.localId)
  } catch {
    return false
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!(await canUseAI(req))) {
    return res.status(402).json({ error: 'Requiere Quacker Premium' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured' })
  }

  const { prompt } = req.body ?? {}
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'prompt is required' })
  }
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'prompt too long' })
  }

  try {
    const generate = async (model) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
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
    let response = await generate(GEMINI_MODEL)
    if ([429, 500, 502, 503, 504].includes(response.status) && GEMINI_FALLBACK_MODEL !== GEMINI_MODEL) {
      await response.text().catch(() => '')
      response = await generate(GEMINI_FALLBACK_MODEL)
    }

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

    if (parsed.dueDate) {
      try {
        const d = new Date(parsed.dueDate)
        if (!isNaN(d.getTime())) {
          parsed.dueDate = d.toISOString()
        } else {
          parsed.dueDate = null
        }
      } catch {
        parsed.dueDate = null
      }
    }

    return res.status(200).json(parsed)
  } catch (e) {
    console.error('Parse task error:', e)
    return res.status(500).json({ error: 'Failed to parse task' })
  }
}
