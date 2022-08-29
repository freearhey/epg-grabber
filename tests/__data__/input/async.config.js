module.exports = {
  site: 'example.com',
  channels: 'example.channels.xml',
  url() {
    return Promise.resolve('http://example.com/20210319/1tv.json')
  },
  request: {
    method: 'POST',
    headers() {
      return Promise.resolve({
        'Content-Type': 'application/json',
        Cookie: 'abc=123'
      })
    },
    data() {
      return Promise.resolve({ accountID: '123' })
    }
  },
  parser() {
    return Promise.resolve([
      {
        title: 'Program1',
        start: 1640995200000,
        stop: 1640998800000
      }
    ])
  },
  logo() {
    return Promise.resolve('http://example.com/logos/1TV.png?x=шеллы&sid=777')
  }
}
