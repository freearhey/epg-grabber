import { SiteConfig } from '../../src/core/siteConfig'
import { expect, describe, test } from 'vitest'
import { Client } from '../../src/core/client'
import { Channel } from '../../src/models'
import dayjs from 'dayjs'

const channel = new Channel({
  xmltv_id: '1tv',
  name: '1TV',
  site: 'example.com',
  site_id: '#',
  lang: null,
  logo: null,
  lcn: null,
  url: null,
  index: -1
})

const siteConfig = new SiteConfig({
  site: 'example.com',
  filepath: 'example.config.js',
  days: 1,
  lang: 'en',
  delay: 3000,
  output: 'guide.xml',
  request: {
    method: 'POST',
    data: () => ({ accountID: '123' }),
    headers: () => ({
      'Content-Type': 'application/json',
      Cookie: 'abc=123',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71'
    }),
    maxContentLength: 5 * 1024 * 1024,
    withCredentials: true,
    responseType: 'arraybuffer',
    cache: false,
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
  url: 'http://example.com/20210319/1tv.json',
  parser: () => []
})

describe('Client', () => {
  test('buildRequest()', async () => {
    const request = await Client.buildRequest({ channel, date: dayjs(), siteConfig })

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
  })
})
