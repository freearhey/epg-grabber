import { SiteConfig } from '../../src/core/siteConfig'
import { test, expect, describe } from 'vitest'
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

describe('SiteConfig', () => {
  test('constructor()', async () => {
    const configObject = (await import('../__data__/input/example.config.cjs')).default
    const siteConfig = new SiteConfig({
      ...configObject,
      filepath: '../__data__/input/example.config.cjs'
    })

    expect(siteConfig).toMatchObject({
      days: 2,
      delay: 3000,
      lang: 'en',
      site: 'example.com'
    })
    expect(siteConfig.request).toMatchObject({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'abc=123'
      }
    })

    const requestContext = { channel, date: dayjs() }

    const data = siteConfig.request?.data
    if (data && typeof data === 'function') {
      expect(data(requestContext)).toEqual({ accountID: '123' })
    } else throw new Error('"request.data" is missing')

    const url = siteConfig.url
    if (url && typeof url === 'function') {
      expect(url(requestContext)).toEqual('http://example.com/20210319/1tv.json')
    } else {
      throw new Error('"url" is not a function')
    }

    const logo = siteConfig.logo
    if (logo && typeof logo === 'function') {
      expect(logo(requestContext)).toEqual('http://example.com/logos/1TV.png?x=шеллы&sid=777')
    } else {
      throw new Error('"logo" is not a function')
    }
  })
})
