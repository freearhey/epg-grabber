import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import path from 'node:path'

dayjs.extend(utc)

export function parseNumber(value: string): number {
  return parseInt(value)
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isDate(date: any): boolean {
  return dayjs(date).isValid()
}

export function isObject(value: any): boolean {
  return !!value && value.constructor === Object
}

export function isPromise(promise: any): boolean {
  return !!promise && typeof promise.then === 'function'
}

export function getUTCDate(date: string | number | Date | Dayjs | null = null) {
  if (typeof date === 'string') return dayjs.utc(date).startOf('d')

  return dayjs.utc().startOf('d')
}

export function getAbsPath(filepath: string, rootDir: string) {
  if (path.isAbsolute(filepath)) return filepath

  return path.resolve(rootDir, filepath)
}

export function escapeString(value: string | number | null, defaultValue = '') {
  if (!value) return defaultValue
  if (typeof value === 'number') value = value.toString()

  const regex = new RegExp(
    '((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))|([\\x7F-\\x84]|[\\x86-\\x9F]|[\\uFDD0-\\uFDEF]|(?:\\uD83F[\\uDFFE\\uDFFF])|(?:\\uD87F[\\uDF' +
      'FE\\uDFFF])|(?:\\uD8BF[\\uDFFE\\uDFFF])|(?:\\uD8FF[\\uDFFE\\uDFFF])|(?:\\uD93F[\\uDFFE\\uD' +
      'FFF])|(?:\\uD97F[\\uDFFE\\uDFFF])|(?:\\uD9BF[\\uDFFE\\uDFFF])|(?:\\uD9FF[\\uDFFE\\uDFFF])' +
      '|(?:\\uDA3F[\\uDFFE\\uDFFF])|(?:\\uDA7F[\\uDFFE\\uDFFF])|(?:\\uDABF[\\uDFFE\\uDFFF])|(?:\\' +
      'uDAFF[\\uDFFE\\uDFFF])|(?:\\uDB3F[\\uDFFE\\uDFFF])|(?:\\uDB7F[\\uDFFE\\uDFFF])|(?:\\uDBBF' +
      '[\\uDFFE\\uDFFF])|(?:\\uDBFF[\\uDFFE\\uDFFF])(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\' +
      'uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|' +
      '(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))',
    'g'
  )

  value = String(value || '').replace(regex, '')

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\n|\r/g, ' ')
    .replace(/  +/g, ' ')
    .trim()
}

export function formatDate(
  date: string | number | Date | Dayjs | null | undefined,
  format: string
) {
  return date ? dayjs.utc(date).format(format) : null
}

export function toURL(domain: string) {
  return domain ? `https://${domain}` : ''
}

export function createXMLElement(name: string, attrs?: Record<string, any>, children?: any[]) {
  return toString({ name, attrs, children })
}

function toString(
  elem: string | number | { name: string; attrs?: Record<string, any>; children?: any[] }
): string {
  if (!elem) return ''
  if (typeof elem === 'string') return elem
  if (typeof elem === 'number') return elem.toString()
  if (!elem.attrs && !elem.children) return `<${elem.name}/>`

  let attrs = ''
  for (let key in elem.attrs) {
    let value = elem.attrs[key]
    if (value) {
      attrs += ` ${key}="${escapeString(value)}"`
    }
  }

  let children = elem.children || []
  if (children.filter(Boolean).length) {
    let _children = ''
    children.forEach(childElem => {
      _children += toString(childElem)
    })

    return `<${elem.name}${attrs}>${_children}</${elem.name}>`
  }

  if (!attrs && !['previously-shown'].includes(elem.name)) return ''

  return `<${elem.name}${attrs}/>`
}

export function toArray(value: any): any[] {
  if (Array.isArray(value)) return value.filter(Boolean)

  return [value].filter(Boolean)
}
