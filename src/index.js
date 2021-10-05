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
    cb(Result)
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
          Result.events['data'](item)
          programs = programs.concat(results)
        })
        .catch(err => {
          Result.events['error'](err)
        })
        .finally(utils.sleep(config.delay))
    }

    Result.events['done'](programs)
  }
}
