const fs = require('fs')
const path = require('path')
const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')
const convert = require('xml-js')
const merge = require('lodash.merge')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
axiosCookieJarSupport(axios)

const utils = {}

utils.loadConfig = function (file) {
  if (!file) throw new Error('Path to [site].config.js is missing')
  console.log(`Loading '${file}'...`)

  const configPath = path.resolve(file)
  const config = require(configPath)

  if (!config.site) throw new Error("The required 'site' property is missing")
  if (!config.channels) throw new Error("The required 'channels' property is missing")
  if (!config.url) throw new Error("The required 'url' property is missing")
  if (typeof config.url !== 'function' && typeof config.url !== 'string')
    throw new Error("The 'url' property should return the function or string")
  if (!config.parser) throw new Error("The required 'parser' function is missing")
  if (typeof config.parser !== 'function')
    throw new Error("The 'parser' property should return the function")
  if (config.logo && typeof config.logo !== 'function')
    throw new Error("The 'logo' property should return the function")

  config.channels = path.join(path.dirname(file), config.channels)

  const defaultConfig = {
    days: 1,
    lang: 'en',
    delay: 3000,
    output: 'guide.xml',
    request: {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71'
      },
      timeout: 5000,
      withCredentials: true,
      jar: new tough.CookieJar(),
      responseType: 'arraybuffer'
    }
  }

  return merge(defaultConfig, config)
}

utils.parseChannels = function (filename) {
  if (!filename) throw new Error('Path to [site].channels.xml is missing')
  console.log(`Loading '${filename}'...`)

  const xml = fs.readFileSync(path.resolve(filename), { encoding: 'utf-8' })
  const result = convert.xml2js(xml)
  const site = result.elements.find(el => el.name === 'site')
  const channels = site.elements.find(el => el.name === 'channels')

  return channels.elements
    .filter(el => el.name === 'channel')
    .map(el => {
      const channel = el.attributes
      if (!el.elements) throw new Error(`Channel '${channel.xmltv_id}' has no valid name`)
      channel.name = el.elements.find(el => el.type === 'text').text
      channel.site = channel.site || site.attributes.site

      return channel
    })
}

utils.sleep = function (ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms))
  }
}

utils.escapeString = function (string, defaultValue = '') {
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

utils.convertToXMLTV = function ({ config, channels, programs }) {
  let output = `<?xml version="1.0" encoding="UTF-8" ?><tv>\r\n`

  for (let channel of channels) {
    const id = this.escapeString(channel['xmltv_id'])
    const displayName = this.escapeString(channel.name)
    output += `<channel id="${id}"><display-name>${displayName}</display-name>`
    if (channel.logo) {
      const logo = this.escapeString(channel.logo)
      output += `<icon src="${logo}" />`
    }
    output += `</channel>\r\n`
  }

  for (let program of programs) {
    if (!program) continue

    const channel = this.escapeString(program.channel)
    const title = this.escapeString(program.title)
    const description = this.escapeString(program.description)
    const category = this.escapeString(program.category)
    const start = program.start ? dayjs.utc(program.start).format('YYYYMMDDHHmmss ZZ') : ''
    const stop = program.stop ? dayjs.utc(program.stop).format('YYYYMMDDHHmmss ZZ') : ''
    const lang = program.lang || config.lang

    if (start && title) {
      output += `<programme start="${start}"`

      if (stop) {
        output += ` stop="${stop}"`
      }

      output += ` channel="${channel}"><title lang="${lang}">${title}</title>`

      if (description) {
        output += `<desc lang="${lang}">${description}</desc>`
      }

      if (category) {
        output += `<category lang="${lang}">${category}</category>`
      }

      output += '</programme>\r\n'
    }
  }

  output += '</tv>'

  return output
}

utils.parsePrograms = function ({ response, item, config }) {
  const options = merge(item, config, {
    content: response.data.toString(),
    buffer: response.data
  })

  return config
    .parser(options)
    .filter(i => i)
    .map(p => {
      p.channel = item.channel.xmltv_id
      return p
    })
}

utils.writeToFile = function (filename, data) {
  const dir = path.resolve(path.dirname(filename))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(path.resolve(filename), data)
}

utils.fetchData = function (item, config) {
  const request = { ...config.request }
  request.url = typeof config.url === 'function' ? config.url(item) : config.url
  request.data =
    typeof config.request.data === 'function' ? config.request.data(item) : config.request.data

  return axios(request)
}

utils.getUTCDate = function () {
  return dayjs.utc()
}

module.exports = utils
