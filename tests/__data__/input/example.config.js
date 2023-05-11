const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'example.com',
  days: 2,
  channels: 'example.channels.xml',
  output: 'tests/__data__/output/guide.xml',
  url: () => 'http://example.com/20210319/1tv.json',
  request: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'abc=123'
    },
    data() {
      return { accountID: '123' }
    }
  },
  parser: () => {
    return [
      {
        title: 'Program1',
        start: 1640995200000,
        stop: 1640998800000
      }
    ]
  },
  logo: () => 'http://example.com/logos/1TV.png?x=шеллы&sid=777'
}
