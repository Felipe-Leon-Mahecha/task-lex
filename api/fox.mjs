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
  // El owner debe tener el email verificado para evitar que alguien se registre
  // con ese email y obtenga privilegios sin verificar.
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

const BASE_PROMPT = `Eres el asistente de productividad de la app Quacker.
El usuario habla español (Colombia). Responde SIEMPRE en español, tono cercano, motivador y breve.
Adapta tu nombre y personalidad a la mascota equipada: pato (Quackington) o zorro (Fox). No hables como zorro si la mascota equipada es el pato.
NUNCA inventes tareas que no estén en los datos proporcionados.`

const ACTION_PROMPTS = {
  plan: `${BASE_PROMPT}

Tu trabajo: crear un plan del día con las tareas pendientes del usuario.

REGLAS:
- Ordena por prioridad (alta > media > baja) y fecha de vencimiento más próxima
- Tareas difíciles/de alta prioridad van temprano (el usuario rinde mejor en la mañana)
- Asigna bloques de tiempo realistas según la naturaleza de la tarea (15 a 90 minutos)
- Usa horas entre las ${'{'}wakeHour{'}'}:00 y las 22:00
- NO incluyas tareas vencidas hace más de 2 días (menciónalas en summary como pendientes de reprogramar)
- reason: máximo 12 palabras, explica POR QUÉ va en ese horario
- summary: resumen motivador de máximo 25 palabras`,

  ask: `${BASE_PROMPT}

Tu trabajo: responder preguntas del usuario sobre SUS tareas usando ÚNICAMENTE los datos entregados.

REGLAS:
- Si la pregunta es sobre productividad/patrones, usa completedLast7Days y stats si están disponibles
- Si no hay datos suficientes, dilo honestamente y sugiere qué hacer
- answer: máximo 60 palabras, directo y útil. Puedes usar listas cortas con guiones si ayuda`,

  breakdown: `${BASE_PROMPT}

Tu trabajo: dividir una tarea grande en subtareas pequeñas y accionables.

REGLAS:
- Entre 3 y 6 subtareas, cada una concreta y complejable en una sesión corta
- Cada subtarea empieza con verbo en infinitivo
- En español, máximo 60 caracteres cada una`,

  energy: `${BASE_PROMPT}

Tu trabajo: sugerir UNA tarea adecuada al estado de energía del usuario.

REGLAS:
- concentrado: sugiere la tarea de mayor prioridad o dificultad
- normal: tarea media, equilibrada
- cansado: tarea liviana, rápida o administrativa; NUNCA una de alta prioridad compleja
- Elige SOLO entre los taskId entregados
- message: máximo 30 palabras, motivador, explica por qué esa tarea encaja con su energía`,

  coach: `${BASE_PROMPT}

Tu trabajo: analizar los patrones de productividad del usuario y darle coaching personalizado.

REGLAS:
- insight: describe el patrón más notable de sus datos (mejor día, comparación semanal, racha) en máximo 40 palabras
- tips: exactamente 3 consejos cortos (máximo 15 palabras cada uno) basados en SUS patrones reales
- NO des consejos genéricos: todo debe salir de los datos entregados`,

  chat: `${BASE_PROMPT}

Estás en modo conversación libre con el usuario. Puedes:
- Responder preguntas sobre sus tareas usando los datos entregados
- Ayudar a pensar y organizar ideas
- Motivar y celebrar logros
- Recomendar por dónde empezar
- Explicar y ayudar a planear la semana usando tareas, horarios y bloques de rutina
- Orientar sobre calendario, estadísticas, notas, temporizador, temas, tienda, inventario y logros
- Proponer subtareas, prioridades y una secuencia realista para objetivos

REGLAS:
- reply: máximo 80 palabras, conversacional y cálido, con la personalidad de la mascota indicada
- Si preguntan algo ambiguo sobre tareas, responde lo más útil según sus datos
- Puedes proponer acciones concretas cuando la persona pida hacer algo. Devuelve hasta 3 acciones en "actions"; si solo pregunta, devuelve [].
- Tipos permitidos: create_task, update_task, create_note, update_note, create_section, rename_section, create_week_block, update_week_block, equip_skin, set_active_pet, navigate.
- Cada acción debe tener summary breve y los campos necesarios. Para actualizar usa únicamente IDs del contexto. No inventes IDs ni cambies campos no pedidos.
- Para horarios, días usa 0=lunes ... 6=domingo; fecha YYYY-MM-DD o cadena vacía; horas HH:mm. Para tareas la prioridad es baja/media/alta y dueDate ISO o cadena vacía.
- Nunca propongas borrar datos, comprar, gastar monedas, cambiar pagos, contraseñas, privacidad o seguridad. No sugieras equipar una skin que no figure desbloqueada.
- Las acciones se mostrarán como borrador y el usuario decidirá si aplicarlas. Si falta información necesaria, pregunta y devuelve actions [].`,

  reschedule: `${BASE_PROMPT}

Tu trabajo: reagendar tareas vencidas a nuevos momentos realistas.

REGLAS:
- Asigna cada tarea vencida a una nueva fecha/hora dentro de los próximos 3 días
- NO pongas todo el mismo día: distribuye según prioridad (alta → antes)
- Horos razonables entre 7:00 y 21:00, evita encimar tareas en la misma hora
- reason: máximo 15 palabras explicando por qué ese momento`,

  briefing: `${BASE_PROMPT}

Tu trabajo: dar el saludo/briefing de inicio del día del usuario.

REGLAS:
- message: máximo 45 palabras, cálido y directo
- Menciona cuántas tareas tiene hoy, cuáles están vencidas (sin regañar) y sugiere por dónde empezar
- Si tiene racha activa, celébrala`,
}

function buildSchema(action) {
  switch (action) {
    case 'plan':
      return {
        type: 'object',
        properties: {
          plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['taskId', 'startTime', 'endTime', 'reason'],
            },
          },
          summary: { type: 'string' },
        },
        required: ['plan', 'summary'],
      }
    case 'breakdown':
      return {
        type: 'object',
        properties: {
          subtasks: { type: 'array', items: { type: 'string' } },
        },
        required: ['subtasks'],
      }
    case 'energy':
      return {
        type: 'object',
        properties: {
          taskId: { type: 'string', nullable: true },
          message: { type: 'string' },
        },
        required: ['message'],
      }
    case 'coach':
      return {
        type: 'object',
        properties: {
          insight: { type: 'string' },
          tips: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
        },
        required: ['insight', 'tips'],
      }
    case 'chat':
      return {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          actions: {
            type: 'array',
            maxItems: 3,
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['create_task', 'update_task', 'create_note', 'update_note', 'create_section', 'rename_section', 'create_week_block', 'update_week_block', 'equip_skin', 'set_active_pet', 'navigate'] },
                summary: { type: 'string' },
                targetId: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                content: { type: 'string' },
                sectionId: { type: 'string' },
                folderId: { type: 'string' },
                priority: { type: 'string', enum: ['baja', 'media', 'alta'] },
                dueDate: { type: 'string' },
                start: { type: 'string' },
                end: { type: 'string' },
                days: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 } },
                date: { type: 'string' },
                details: { type: 'string' },
                pet: { type: 'string', enum: ['fox', 'quackington'] },
                skinId: { type: 'string' },
                route: { type: 'string' },
                icon: { type: 'string' },
              },
              required: ['type', 'summary', 'targetId', 'title', 'description', 'content', 'sectionId', 'folderId', 'priority', 'dueDate', 'start', 'end', 'days', 'date', 'details', 'pet', 'skinId', 'route', 'icon'],
            },
          },
        },
        required: ['reply', 'actions'],
      }
    case 'reschedule':
      return {
        type: 'object',
        properties: {
          plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                newDueDate: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['taskId', 'newDueDate', 'reason'],
            },
          },
        },
        required: ['plan'],
      }
    case 'briefing':
      return {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      }
    default:
      return {
        type: 'object',
        properties: {
          answer: { type: 'string' },
        },
        required: ['answer'],
      }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!(await canUseAI(req))) return res.status(402).json({ error: 'Requiere Quacker Premium' })

  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'AI service not configured' })

      const { action, prompt, tasks, stats, title, description, mood, messages, overdueTasks, now, pet = 'fox', petName, appContext } = req.body ?? {}
  if (!action || !ACTION_PROMPTS[action]) return res.status(400).json({ error: 'Invalid action' })

  let userContent = ''
  let systemPrompt = ''
  let contents = null

  try {
    switch (action) {
      case 'plan': {
        if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks is required' })
        const wakeHour = Number(stats?.wakeHour) || 7
        systemPrompt = ACTION_PROMPTS.plan.replace('{wakeHour}', String(wakeHour))
        userContent = `Hora actual: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
Tareas pendientes (JSON):
${JSON.stringify(tasks)}`
        break
      }
      case 'ask': {
        if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt is required' })
        systemPrompt = ACTION_PROMPTS.ask
        userContent = `Pregunta del usuario: "${prompt}"
Datos de tareas (JSON): ${JSON.stringify(tasks ?? [])}
Estadísticas (JSON): ${JSON.stringify(stats ?? {})}`
        break
      }
      case 'breakdown': {
        if (!title) return res.status(400).json({ error: 'title is required' })
        systemPrompt = ACTION_PROMPTS.breakdown
        userContent = `Tarea: "${title}"${description ? `\nContexto: ${description}` : ''}`
        break
      }
      case 'energy': {
        if (!mood || !Array.isArray(tasks)) return res.status(400).json({ error: 'mood and tasks are required' })
        systemPrompt = ACTION_PROMPTS.energy
        userContent = `Estado de energía: "${mood}"
Tareas pendientes (JSON):
${JSON.stringify(tasks)}`
        break
      }
      case 'coach': {
        systemPrompt = ACTION_PROMPTS.coach
        userContent = `Patrones del usuario (JSON):
${JSON.stringify(stats ?? {})}`
        break
      }
      case 'reschedule': {
        if (!Array.isArray(overdueTasks) || overdueTasks.length === 0) return res.status(400).json({ error: 'overdueTasks is required' })
        systemPrompt = ACTION_PROMPTS.reschedule
        userContent = `Fecha/hora actual: ${now ?? new Date().toISOString()}
Tareas vencidas (JSON):
${JSON.stringify(overdueTasks)}`
        break
      }
      case 'briefing': {
        systemPrompt = ACTION_PROMPTS.briefing
        userContent = `Resumen del usuario (JSON):
${JSON.stringify(stats ?? {})}

Contexto de tiempo: es ${new Intl.DateTimeFormat('es-CO', { weekday: 'long', hour: 'numeric', minute: 'numeric', timeZone: 'America/Bogota' }).format(new Date())}`
        break
      }
      case 'chat': {
        if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'messages is required' })
        if (messages.length > 50) return res.status(400).json({ error: 'too many messages' })
        systemPrompt = `${ACTION_PROMPTS.chat}\n\nMascota equipada: ${pet === 'quackington' ? `pato (${String(petName || 'Quackington')})` : 'zorro (Fox)'}. Preséntate y habla desde la personalidad de esa mascota.`
        const history = messages.slice(-12).map((m) => ({
          role: m.role === 'fox' ? 'model' : 'user',
          parts: [{ text: String(m.text ?? '') }],
        }))
        contents = [
          { role: 'user', parts: [{ text: `Contexto actual de Quacker (JSON, puede tener listas de tareas, notas no privadas, secciones, horario semanal y skins desbloqueadas): ${JSON.stringify({ tasks: Array.isArray(tasks) ? tasks.slice(0, 60) : [], stats: stats ?? {}, appContext: appContext ?? {} }).slice(0, 24000)}. Usa solo IDs presentes aquí. Nunca repitas contenido privado.` }] },
          { role: 'model', parts: [{ text: 'Entendido, tengo el contexto. Adelante.' }] },
          ...history,
        ]
        break
      }
    }

    if (!contents) {
      contents = [{ role: 'user', parts: [{ text: userContent }] }]
    }

    const generate = async (model) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: buildSchema(action),
          temperature: action === 'chat' ? 0.6 : 0.3,
        },
        }),
      })
    }
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
    if (!text) return res.status(502).json({ error: 'Empty AI response' })

    return res.status(200).json(JSON.parse(text))
  } catch (e) {
    console.error('Fox AI error:', e)
    return res.status(500).json({ error: 'Fox AI failed' })
  }
}
