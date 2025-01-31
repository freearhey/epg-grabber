const { URL } = require('node:url')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports.sleep = sleep
module.exports.getUTCDate = getUTCDate
module.exports.isPromise = isPromise
module.exports.isObject = isObject
module.exports.escapeString = escapeString
module.exports.parseNumber = parseNumber
module.exports.formatDate = formatDate
module.exports.toArray = toArray
module.exports.toUnix = toUnix
module.exports.isDate = isDate
module.exports.parseProxy = parseProxy

function parseProxy(_url) {
  const parsed = new URL(_url)

  return {
    protocol: parsed.protocol.replace(':', '') || null,
    auth: {
      username: parsed.username || null,
      password: parsed.password || null
    },
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port) : null
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isDate(d) {
  return dayjs(d).isValid()
}

function isObject(a) {
  return !!a && a.constructor === Object
}

function isPromise(promise) {
  return !!promise && typeof promise.then === 'function'
}

function getUTCDate(d = null) {
  if (typeof d === 'string') return dayjs.utc(d).startOf('d')

  return dayjs.utc().startOf('d')
}

function toUnix(d) {
  return dayjs.utc(d).valueOf()
}

function escapeString(string, defaultValue = '') {
  if (!string) return defaultValue

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

  string = String(string || '').replace(regex, '')

  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\n|\r/g, ' ')
    .replace(/  +/g, ' ')
    .trim()
}

function parseNumber(val) {
  return val ? parseInt(val) : null
}

function formatDate(date, format) {
  return date ? dayjs.utc(date).format(format) : null
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)

  return [value].filter(Boolean)
}
