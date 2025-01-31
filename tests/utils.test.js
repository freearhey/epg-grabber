import { escapeString, parseProxy } from '../src/utils'

it('can escape string', () => {
  const string = 'Música тест dun.  &<>"\'\r\n'
  expect(escapeString(string)).toBe('Música тест dun. &amp;&lt;&gt;&quot;&apos;')
})

it('can escape url', () => {
  const string = 'http://example.com/logos/1TV.png?param1=val&param2=val'
  expect(escapeString(string)).toBe('http://example.com/logos/1TV.png?param1=val&amp;param2=val')
})

it('can parse proxy', () => {
  const string = 'socks://127.0.0.1:1234'
  expect(parseProxy(string)).toMatchObject({
    protocol: 'socks'
  })
})
