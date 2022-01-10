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

let timeout
const utils = {}
const defaultUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71'

utils.loadConfig = function (config) {
  if (!config.site) throw new Error("The required 'site' property is missing")
  if (!config.url) throw new Error("The required 'url' property is missing")
  if (typeof config.url !== 'function' && typeof config.url !== 'string')
    throw new Error("The 'url' property should return the function or string")
  if (!config.parser) throw new Error("The required 'parser' function is missing")
  if (typeof config.parser !== 'function')
    throw new Error("The 'parser' property should return the function")
  if (config.logo && typeof config.logo !== 'function')
    throw new Error("The 'logo' property should return the function")

  const defaultConfig = {
    days: 1,
    lang: 'en',
    delay: 3000,
    output: 'guide.xml',
    request: {
      method: 'GET',
      maxContentLength: 5 * 1024 * 1024,
      timeout: 5000,
      withCredentials: true,
      jar: new tough.CookieJar(),
      responseType: 'arraybuffer'
    }
  }

  return merge(defaultConfig, config)
}

utils.parseChannels = function (xml) {
  const result = convert.xml2js(xml)
  const siteTag = result.elements.find(el => el.name === 'site') || {}
  if (!siteTag.elements) return []
  const site = siteTag.attributes.site

  const channelsTag = siteTag.elements.find(el => el.name === 'channels')
  if (!channelsTag.elements) return []

  const channels = channelsTag.elements
    .filter(el => el.name === 'channel')
    .map(el => {
      const channel = el.attributes
      if (!el.elements) throw new Error(`Channel '${channel.xmltv_id}' has no valid name`)
      channel.name = el.elements.find(el => el.type === 'text').text
      channel.site = channel.site || site

      return channel
    })

  return channels
}

utils.sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

utils.convertToXMLTV = function ({ channels, programs }) {
  let output = `<?xml version="1.0" encoding="UTF-8" ?><tv>\r\n`
  for (let channel of channels) {
    const id = utils.escapeString(channel['xmltv_id'])
    const displayName = utils.escapeString(channel.name)
    output += `<channel id="${id}"><display-name>${displayName}</display-name>`
    if (channel.logo) {
      const logo = utils.escapeString(channel.logo)
      output += `<icon src="${logo}"/>`
    }
    if (channel.site) {
      const url = channel.site ? 'https://' + channel.site : null
      output += `<url>${url}</url>`
    }
    output += `</channel>\r\n`
  }

  for (let program of programs) {
    if (!program) continue

    const channel = utils.escapeString(program.channel)
    const title = utils.escapeString(program.title)
    const description = utils.escapeString(program.description)
    const categories = Array.isArray(program.category) ? program.category : [program.category]
    const start = program.start ? dayjs.utc(program.start).format('YYYYMMDDHHmmss ZZ') : ''
    const stop = program.stop ? dayjs.utc(program.stop).format('YYYYMMDDHHmmss ZZ') : ''
    const lang = program.lang || 'en'
    const icon = utils.escapeString(program.icon)

    if (start && stop && title) {
      output += `<programme start="${start}" stop="${stop}" channel="${channel}"><title lang="${lang}">${title}</title>`

      if (description) {
        output += `<desc lang="${lang}">${description}</desc>`
      }

      if (categories.length) {
        categories.forEach(category => {
          if (category) {
            output += `<category lang="${lang}">${utils.escapeString(category)}</category>`
          }
        })
      }

      if (icon) {
        output += `<icon src="${icon}"/>`
      }

      output += '</programme>\r\n'
    }
  }

  output += '</tv>'

  return output
}

utils.writeToFile = function (filename, data) {
  const dir = path.resolve(path.dirname(filename))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(path.resolve(filename), data)
}

utils.buildRequest = async function (item, config) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  const request = { ...config.request }
  timeout = setTimeout(() => {
    source.cancel('Connection timeout')
  }, request.timeout)
  const headers = await utils.getRequestHeaders(item, config)
  request.headers = { 'User-Agent': defaultUserAgent, ...headers }
  request.url = await utils.getRequestUrl(item, config)
  request.data = await utils.getRequestData(item, config)
  request.cancelToken = source.token

  if (config.debug) {
    console.log('Request:', JSON.stringify(request, null, 2))
  }

  return request
}

utils.fetchData = function (request) {
  axios.interceptors.response.use(
    function (response) {
      clearTimeout(timeout)
      return response
    },
    function (error) {
      clearTimeout(timeout)
      return Promise.reject(error)
    }
  )

  return axios(request)
}

utils.getRequestHeaders = async function (item, config) {
  if (typeof config.request.headers === 'function') {
    const headers = config.request.headers(item)
    if (this.isPromise(headers)) {
      return await headers
    }
    return headers
  }
  return config.request.headers || null
}

utils.getRequestData = async function (item, config) {
  if (typeof config.request.data === 'function') {
    const data = config.request.data(item)
    if (this.isPromise(data)) {
      return await data
    }
    return data
  }
  return config.request.data || null
}

utils.getRequestUrl = async function (item, config) {
  if (typeof config.url === 'function') {
    const url = config.url(item)
    if (this.isPromise(url)) {
      return await url
    }
    return url
  }
  return config.url
}

utils.getUTCDate = function () {
  return dayjs.utc().startOf('d')
}

utils.parseResponse = async (item, response, config) => {
  const data = merge(item, config, {
    content: response.data.toString(),
    buffer: response.data
  })

  if (!item.channel.logo && config.logo) {
    item.channel.logo = await utils.loadLogo(data, config)
  }

  return await utils.parsePrograms(data, config)
}

utils.parsePrograms = async function (data, config) {
  let programs = config.parser(data)

  if (this.isPromise(programs)) {
    programs = await programs
  }

  if (!Array.isArray(programs)) {
    throw new Error('Parser should return an array')
  }

  const channel = data.channel
  return programs
    .filter(i => i)
    .map(program => {
      return {
        title: program.title,
        description: program.description || null,
        category: program.category || null,
        icon: program.icon || null,
        channel: channel.xmltv_id,
        lang: program.lang || channel.lang || config.lang || 'en',
        start: program.start ? dayjs(program.start).unix() : null,
        stop: program.stop ? dayjs(program.stop).unix() : null
      }
    })
}

utils.loadLogo = async function (options, config) {
  const logo = config.logo(options)
  if (this.isPromise(logo)) {
    return await logo
  }
  return logo
}

utils.isPromise = function (promise) {
  return !!promise && typeof promise.then === 'function'
}

module.exports = utils
