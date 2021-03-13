const fs = require('fs')
const path = require('path')
const axios = require('axios')
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')
const convert = require('xml-js')
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

  return Object.assign(
    {},
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71',
      days: 1,
      cookie: '',
      lang: 'en',
      delay: 3000
    },
    config
  )
}

utils.parseChannels = function (configPath, channelsFilename) {
  if (!channelsFilename) throw new Error('Path to [site].channels.xml is missing')
  console.log(`Loading '${path.join(path.dirname(configPath), channelsFilename)}'...`)

  const channelsPath = path.resolve(path.dirname(configPath), channelsFilename)
  const xml = fs.readFileSync(channelsPath, { encoding: 'utf-8' })
  const result = convert.xml2js(xml)
  const site = result.elements.find(el => el.name === 'site')
  const channels = site.elements.find(el => el.name === 'channels')

  return channels.elements
    .filter(el => el.name === 'channel')
    .map(el => {
      const channel = el.attributes
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

  return string
    .toString()
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
    output += `<channel id="${id}"><display-name>${displayName}</display-name></channel>\r\n`
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

utils.writeToFile = function (filename, data) {
  const dir = path.resolve(path.dirname(filename))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(path.resolve(filename), data)
}

utils.createHttpClient = function (config) {
  return axios.create({
    headers: {
      'User-Agent': config.userAgent,
      Cookie: config.cookie
    },
    withCredentials: true,
    jar: new tough.CookieJar()
  })
}

utils.getUTCDate = function () {
  return dayjs.utc()
}

module.exports = utils
