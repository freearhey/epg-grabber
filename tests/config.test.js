import { parse as parseConfig } from '../src/config'
import path from 'path'
import fs from 'fs'

it('can load config', () => {
  const config = parseConfig(require(path.resolve('./tests/__data__/input/example.config.js')))
  expect(config).toMatchObject({
    days: 2,
    delay: 3000,
    lang: 'en',
    site: 'example.com'
  })
  expect(config.request).toMatchObject({
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'abc=123'
    }
  })
  expect(typeof config.request.data).toEqual('function')
  expect(typeof config.url).toEqual('function')
  expect(typeof config.logo).toEqual('function')
  expect(config.request.data()).toEqual({ accountID: '123' })
  expect(config.url()).toEqual('http://example.com/20210319/1tv.json')
  expect(config.logo()).toEqual('http://example.com/logos/1TV.png?x=шеллы&sid=777')
})
