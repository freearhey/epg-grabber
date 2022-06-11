const { merge } = require('lodash')
const { create: createClient, buildRequest, parseResponse } = require('./client')
const { generate: generateXMLTV } = require('./xmltv')
const { parse: parseChannels } = require('./channels')
const { parse: parsePrograms } = require('./programs')
const { load: loadConfig } = require('./config')
const { sleep, isPromise } = require('./utils')

class EPGGrabber {
  constructor(config = {}) {
    this.config = loadConfig(config)
    this.client = createClient(config)
  }

  async loadLogo(channel) {
    const logo = this.config.logo({ channel })
    if (isPromise(logo)) {
      return await logo
    }
    return logo
  }

  async grab(channel, date, cb = () => {}) {
    await sleep(this.config.delay)

    return buildRequest({ channel, date, config: this.config })
      .then(this.client)
      .then(parseResponse)
      .then(data => merge({ channel, date, config: this.config }, data))
      .then(parsePrograms)
      .then(programs => {
        cb({ channel, date, programs })

        return programs
      })
      .catch(err => {
        if (this.config.debug) console.log('Error:', JSON.stringify(err, null, 2))
        cb({ channel, date, programs: [] }, err)

        return []
      })
  }
}

EPGGrabber.prototype.generateXMLTV = generateXMLTV
EPGGrabber.prototype.parseChannels = parseChannels

module.exports = EPGGrabber
