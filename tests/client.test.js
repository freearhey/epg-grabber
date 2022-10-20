import { buildRequest, create as createClient } from '../src/client'

const config = {
  days: 1,
  lang: 'en',
  delay: 3000,
  output: 'guide.xml',
  request: {
    method: 'POST',
    maxContentLength: 5 * 1024 * 1024,
    timeout: 5000,
    withCredentials: true,
    responseType: 'arraybuffer',
    cache: false,
    data: { accountID: '123' },
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'abc=123',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71'
    },
    proxy: {
      protocol: 'https',
      host: '127.0.0.1',
      port: 9000,
      auth: {
        username: 'mikeymike',
        password: 'rapunz3l'
      }
    }
  },
  url: 'http://example.com/20210319/1tv.json'
}

it('can build request', done => {
  buildRequest({ config })
    .then(request => {
      expect(request).toMatchObject({
        data: { accountID: '123' },
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'abc=123',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71'
        },
        maxContentLength: 5242880,
        method: 'POST',
        responseType: 'arraybuffer',
        timeout: 5000,
        url: 'http://example.com/20210319/1tv.json',
        withCredentials: true,
        proxy: {
          protocol: 'https',
          host: '127.0.0.1',
          port: 9000,
          auth: {
            username: 'mikeymike',
            password: 'rapunz3l'
          }
        }
      })
      done()
    })
    .catch(done)
})
