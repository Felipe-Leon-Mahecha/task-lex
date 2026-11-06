const ALLOWED_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'mark', 'br'])

export function sanitizeHtml(raw: string): string {
  if (!raw) return ''
  let h = raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  // Convertir spans con estilos a tags semánticos (antes de sanear)
  h = h.replace(/<span([^>]*)>/gi, (_m, attrs) => {
    const a = String(attrs || '')
    if (/background-color\s*:\s*[^;]+/i.test(a)) return '<mark>'
    if (/text-decoration\s*:\s*underline/i.test(a)) return '<u>'
    if (/text-decoration\s*:\s*line-through/i.test(a)) return '<s>'
    return '<span>'
  })
  h = h.replace(/<\/span>/gi, '</span>')

  // Parsear con DOMParser para sanear de forma robusta
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${h}</div>`, 'text/html')
    const root = doc.body.firstChild as HTMLElement | null
    if (!root) return ''

    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return ''
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()
      if (tag === 'br') return '<br>'
      if (tag === 'div' || tag === 'p') {
        // Convertir div/p a saltos de línea
        const inner = Array.from(el.childNodes).map(walk).join('')
        return inner + '<br>'
      }
      if (!ALLOWED_TAGS.has(tag)) {
        // Eliminar el tag pero conservar el contenido
        return Array.from(el.childNodes).map(walk).join('')
      }
      // Tag permitido: solo conservar el tag, sin atributos
      const inner = Array.from(el.childNodes).map(walk).join('')
      return `<${tag}>${inner}</${tag}>`
    }

    let result = Array.from(root.childNodes).map(walk).join('')
    // Limpiar <br> consecutivos excesivos
    result = result.replace(/(<br>\s*){3,}/g, '<br><br>')
    // Eliminar <br> al final
    result = result.replace(/(<br>\s*)+$/g, '')
    return result.trim()
  } catch {
    // Fallback a regex si DOMParser no está disponible
    h = h.replace(/<[^>]*(on\w+\s*=|javascript:)[^>]*>/gi, '')
    h = h.replace(/\s(?:on\w+|style|class|id)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    h = h.replace(/<(?!\/?(?:b|strong|i|em|u|s|mark|br)\b)[^>]*>/gi, '')
    return h.trim()
  }
}

export function plainText(html: string): string {
  const el = document.createElement('div')
  el.innerHTML = sanitizeHtml(html)
  return el.textContent || ''
}

export function splitHtmlLines(html: string): string[] {
  return sanitizeHtml(html)
    .split(/<br\s*\/?>/i)
    .map((l) => l.replace(/<[^>]+>/g, ''))
}
