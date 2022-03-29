const fs = require('fs')
const { padStart } = require('lodash')
const path = require('path')
const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const axiosCacheAdapter = require('axios-cache-adapter')
const tough = require('tough-cookie')
const convert = require('xml-js')
const { merge } = require('lodash')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { CurlGenerator } = require('curl-generator')
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
      responseType: 'arraybuffer',
      cache: {
        readHeaders: false,
        exclude: {
          query: false
        },
        maxAge: 0
      }
    }
  }

  return merge(defaultConfig, config)
}

utils.createClient = function (config) {
  const client = axiosCacheAdapter.setup()
  client.interceptors.request.use(
    function (request) {
      if (config.debug) {
        console.log('Request:', JSON.stringify(request, null, 2))
      }
      return request
    },
    function (error) {
      return Promise.reject(error)
    }
  )
  client.interceptors.response.use(
    function (response) {
      if (config.debug) {
        const data = utils.isObject(response.data)
          ? JSON.stringify(response.data)
          : response.data.toString()
        console.log(
          'Response:',
          JSON.stringify(
            {
              headers: response.headers,
              data,
              fromCache: response.request.fromCache === true
            },
            null,
            2
          )
        )
      }

      clearTimeout(timeout)
      return response
    },
    function (error) {
      clearTimeout(timeout)
      return Promise.reject(error)
    }
  )

  return client
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

  return { site, channels }
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
    const start = program.start ? dayjs.unix(program.start).utc().format('YYYYMMDDHHmmss ZZ') : ''
    const stop = program.stop ? dayjs.unix(program.stop).utc().format('YYYYMMDDHHmmss ZZ') : ''
    const lang = program.lang || 'en'
    const xmltv_ns = createXMLTVNS(program.season, program.episode)
    const onscreen = createOnScreen(program.season, program.episode)
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

      if (xmltv_ns) {
        output += `<episode-num system="xmltv_ns">${xmltv_ns}</episode-num>`
      }

      if (onscreen) {
        output += `<episode-num system="onscreen">${onscreen}</episode-num>`
      }

      if (icon) {
        output += `<icon src="${icon}"/>`
      }

      output += '</programme>\r\n'
    }
  }

  output += '</tv>'

  function createXMLTVNS(s, e) {
    if (!s || !e) return null

    return `${s - 1}.${e - 1}.0/1`
  }

  function createOnScreen(s, e) {
    if (!s || !e) return null

    s = padStart(s, 2, '0')
    e = padStart(e, 2, '0')

    return `S${s}E${e}`
  }

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

  if (config.curl) {
    const curl = CurlGenerator({
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.data
    })
    console.log(curl)
  }

  return request
}

utils.fetchData = function (client, request) {
  return client(request)
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

utils.getUTCDate = function (d = null) {
  if (typeof d === 'string') return dayjs.utc(d).startOf('d')

  return dayjs.utc().startOf('d')
}

utils.parseResponse = async (item, response, config) => {
  const content = utils.isObject(response.data)
    ? JSON.stringify(response.data)
    : response.data.toString()
  const buffer = Buffer.from(content, 'utf8')
  const data = merge(item, config, {
    content,
    buffer,
    headers: response.headers,
    request: response.request
  })

  if (!item.channel.logo && config.logo) {
    data.channel.logo = await utils.loadLogo(data, config)
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
        season: program.season || null,
        episode: program.episode || null,
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

utils.isObject = function (a) {
  return !!a && a.constructor === Object
}

module.exports = utils
