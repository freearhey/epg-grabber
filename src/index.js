const utils = require('./utils')

class EPGGrabber {
  constructor(config = {}) {
    this.config = utils.loadConfig(config)
    this.client = utils.createClient(config)
  }

  async grab(channel, date, cb = () => {}) {
    date = typeof date === 'string' ? utils.getUTCDate(date) : date
    channel.lang = channel.lang || this.config.lang || null

    let programs = []
    const item = { date, channel }
    await utils
      .buildRequest(item, this.config)
      .then(request => utils.fetchData(this.client, request))
      .then(response => utils.parseResponse(item, response, this.config))
      .then(results => {
        item.programs = results
        cb(item, null)
        programs = programs.concat(results)
      })
      .catch(error => {
        item.programs = []
        if (this.config.debug) {
          console.log('Error:', JSON.stringify(error, null, 2))
        }
        cb(item, error)
      })

    await utils.sleep(this.config.delay)

    return programs
  }
}

EPGGrabber.convertToXMLTV = utils.convertToXMLTV
EPGGrabber.parseChannels = utils.parseChannels

module.exports = EPGGrabber
