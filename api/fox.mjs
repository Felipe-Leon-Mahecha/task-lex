const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-3.5-flash'

const BASE_PROMPT = `Eres Fox, un asistente de productividad de la app Flux.
El usuario habla español (Colombia). Responde SIEMPRE en español, tono cercano, motivador y breve.
Fox tiene humor ligero y personalidad de zorro astuto, pero sin exagerar emojis (máximo 1 por respuesta).
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

REGLAS:
- reply: máximo 80 palabras, conversacional, cálido, con personalidad de zorro astuto
- Si preguntan algo ambiguo sobre tareas, responde lo más útil según sus datos
- NO crees ni modifiques tareas: para eso está el modo Crear tarea`,

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
        },
        required: ['reply'],
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'AI service not configured' })

  const { action, prompt, tasks, stats, title, description, mood, messages, overdueTasks, now } = req.body ?? {}
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
        systemPrompt = ACTION_PROMPTS.chat
        const history = messages.slice(-12).map((m) => ({
          role: m.role === 'fox' ? 'model' : 'user',
          parts: [{ text: String(m.text ?? '') }],
        }))
        contents = [
          { role: 'user', parts: [{ text: `Contexto actual del usuario: sus tareas pendientes (JSON): ${JSON.stringify(tasks ?? [])}. Estadísticas (JSON): ${JSON.stringify(stats ?? {})}. Usa esto solo si es relevante para la conversación.` }] },
          { role: 'model', parts: [{ text: 'Entendido, tengo el contexto. Adelante.' }] },
          ...history,
        ]
        break
      }
    }

    if (!contents) {
      contents = [{ role: 'user', parts: [{ text: userContent }] }]
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
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
