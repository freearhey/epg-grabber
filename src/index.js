const { merge } = require('lodash')
const { create: createClient, buildRequest, parseResponse } = require('./client')
const { parseChannels, parsePrograms } = require('./parser')
const { sleep, isPromise, getUTCDate } = require('./utils')
const { generate: generateXMLTV } = require('./xmltv')
const { parse: parseConfig } = require('./config')
const Channel = require('./Channel')
const Program = require('./Program')

module.exports.generateXMLTV = generateXMLTV
module.exports.parseChannels = parseChannels
module.exports.Channel = Channel
module.exports.Program = Program

class EPGGrabber {
  constructor(config = {}) {
    this.config = config
    this.client = createClient(config)
  }

  async loadLogo(channel) {
    const logo = this.config.logo({ channel })
    if (isPromise(logo)) {
      return await logo
    }
    return logo
  }

  async grab(channel, date, config = {}, cb = () => {}) {
    if (typeof config == 'function') {
      cb = config
      config = {}
    }
    config = merge(this.config, config)
    config = parseConfig(config)
    if (!(channel instanceof Channel)) {
      throw new Error('The first argument must be the "Channel" class')
    }

    await sleep(config.delay)

    date = typeof date === 'string' ? getUTCDate(date) : date
    return buildRequest({ channel, date, config })
      .then(this.client)
      .then(parseResponse)
      .then(data => merge({ channel, date, config }, data))
      .then(parsePrograms)
      .then(programs => {
        cb({ channel, date, programs })

        return programs
      })
      .catch(err => {
        if (config.debug) console.log('Error:', JSON.stringify(err, null, 2))
        cb({ channel, date, programs: [] }, err)

        return []
      })
  }
}

class EPGGrabberMock {
  constructor(config) {
    this.config = config
  }

  async grab(channel, date, config = {}, cb = () => {}) {
    let _date = getUTCDate(date)
    if (typeof config == 'function') {
      cb = config
      config = {}
    }
    config = merge(this.config, config)
    config = parseConfig(config)
    let _programs = await config.parser({ channel, date: _date })
    let programs = _programs.map(data => new Program(data, channel))

    if (config.request?.timeout !== undefined && config.request.timeout < 1) {
      cb({ programs: [], date: _date, channel }, new Error('Connection timeout'))
      return []
    }

    cb({ programs, date: _date, channel }, null)

    return programs
  }
}

module.exports.EPGGrabber = EPGGrabber
module.exports.EPGGrabberMock = EPGGrabberMock
