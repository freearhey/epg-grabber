const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  site: 'example.com',
  ignore: true,
  channels: 'example.com.channels.xml',
  output: 'tests/output/guide.xml',
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
        title: 'Title',
        description: 'Description',
        lang: 'en',
        category: ['Category1', 'Category2'],
        icon: 'https://example.com/image.jpg',
        season: 9,
        episode: 238,
        start: dayjs.utc('2022-01-01 00:00:00'),
        stop: dayjs.utc('2022-01-01 01:00:00')
      }
    ]
  },
  logo: () => 'http://example.com/logos/1TV.png?x=шеллы&sid=777'
}
