const utils = require('./utils')

module.exports = {
  grab: async function (channel, config, cb) {
    config = utils.loadConfig(config)
    channel.lang = channel.lang || config.lang || null

    const utcDate = utils.getUTCDate()
    const dates = Array.from({ length: config.days }, (_, i) => utcDate.add(i, 'd'))
    const queue = []
    dates.forEach(date => {
      queue.push({ date, channel })
    })

    let programs = []
    for (let item of queue) {
      if (config.ignore) {
        item.programs = []
        cb(item, new Error('Skipped'))
        continue
      }

      await utils
        .buildRequest(item, config)
        .then(request => utils.fetchData(request))
        .then(response => utils.parseResponse(item, response, config))
        .then(results => {
          item.programs = results
          cb(item, null)
          programs = programs.concat(results)
        })
        .catch(err => {
          item.programs = []
          cb(item, err)
        })

      await utils.sleep(config.delay)
    }

    return programs
  },
  convertToXMLTV: utils.convertToXMLTV,
  parseChannels: utils.parseChannels
}
