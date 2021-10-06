const axios = require('axios').default
const utils = require('./utils')

const Result = {
  events: {
    data: () => {},
    error: () => {},
    done: () => {}
  },
  on(type, cb) {
    this.events[type] = cb
  }
}

module.exports = {
  grab: async function (channel, config, cb) {
    config = utils.loadConfig(config)

    const utcDate = utils.getUTCDate()
    const dates = Array.from({ length: config.days }, (_, i) => utcDate.add(i, 'd'))
    const queue = []
    dates.forEach(date => {
      queue.push({ date, channel })
    })

    let programs = []
    for (let item of queue) {
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
  convertToXMLTV: utils.convertToXMLTV
}
