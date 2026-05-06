import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's', 'code', 'pre',
  'a', 'ul', 'ol', 'li', 'blockquote',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class']

// Force safe link attributes
if (typeof window !== 'undefined' && DOMPurify.addHook) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer nofollow')
    }
  })
}

function isHtml(str) {
  return typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str)
}

export default function RichText({ html, className = '' }) {
  if (!html) return null

  // Backwards compat: legacy plain-text descriptions render with line breaks.
  if (!isHtml(html)) {
    return (
      <div className={`whitespace-pre-wrap ${className}`}>{html}</div>
    )
  }

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })

  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}

export function htmlToPlainText(html) {
  if (!html) return ''
  if (!isHtml(html)) return html
  if (typeof window === 'undefined') return html.replace(/<[^>]+>/g, ' ').trim()
  const tmp = document.createElement('div')
  tmp.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
  return (tmp.textContent || tmp.innerText || '').trim()
}
