import { escapeString, parseProxy, sleep } from '../../src/core/utils'
import { it, expect, describe, test, vi } from 'vitest'

describe('sleep()', () => {
  it('can be skiped during test', async () => {
    vi.useFakeTimers()

    const promise = sleep(3000)

    vi.advanceTimersByTime(3000)

    await promise
  })
})

describe('escapeString()', () => {
  it('can escape string', () => {
    const string = 'Música тест dun.  &<>"\'\r\n'
    expect(escapeString(string)).toBe('Música тест dun. &amp;&lt;&gt;&quot;&apos;')
  })

  it('can escape url', () => {
    const string = 'http://example.com/logos/1TV.png?param1=val&param2=val'
    expect(escapeString(string)).toBe('http://example.com/logos/1TV.png?param1=val&amp;param2=val')
  })
})

test('parseProxy()', () => {
  const string = 'socks://127.0.0.1:1234'

  expect(parseProxy(string)).toMatchObject({
    protocol: 'socks'
  })
})
