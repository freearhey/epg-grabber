import { it, describe, expect } from 'vitest'
import { escapeString } from '../src/utils'

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
