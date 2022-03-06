const utils = require('./utils')

module.exports = {
  grab: async function (channel, date, config, cb) {
    date = typeof date === 'string' ? utils.getUTCDate(date) : date
    config = utils.loadConfig(config)
    channel.lang = channel.lang || config.lang || null

    let programs = []

    const item = { date, channel }
    await utils
      .buildRequest(item, config)
      .then(request => utils.fetchData(request))
      .then(response => utils.parseResponse(item, response, config))
      .then(results => {
        item.programs = results
        cb(item, null)
        programs = programs.concat(results)
      })
      .catch(error => {
        item.programs = []
        if (config.debug) {
          console.log('Error:', JSON.stringify(error, null, 2))
        }
        cb(item, error)
      })

    await utils.sleep(config.delay)

    return programs
  },
  convertToXMLTV: utils.convertToXMLTV,
  parseChannels: utils.parseChannels
}
