import { ProxyParser } from '../../src/core/proxyParser'
import { describe, test, expect } from 'vitest'

describe('ProxyParser', () => {
  test('parse()', () => {
    const string = 'socks://127.0.0.1:1234'

    expect(ProxyParser.parse(string)).toMatchObject({
      protocol: 'socks'
    })
  })
})
