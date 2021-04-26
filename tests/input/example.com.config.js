module.exports = {
  site: 'example.com',
  channels: 'example.com.channels.xml',
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
  parser: () => [],
  logo: () => 'http://example.com/logos/1TV.png?x=шеллы&sid=777'
}
