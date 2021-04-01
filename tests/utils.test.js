const utils = require('../src/utils')

it('can load valid config.js', () => {
  expect(Object.keys(utils.loadConfig('./tests/input/example.com.config.js')).sort()).toEqual(
    [
      'site',
      'channels',
      'url',
      'logo',
      'parser',
      'cookie',
      'days',
      'delay',
      'timeout',
      'lang',
      'output',
      'userAgent'
    ].sort()
  )
})

it('can parse valid channels.xml', () => {
  expect(utils.parseChannels('./tests/input/example.com.channels.xml')).toEqual([
    {
      name: '1 TV',
      xmltv_id: '1TV.com',
      site_id: '1',
      site: 'example.com',
      lang: 'fr',
      logo: 'https://example.com/logos/1TV.png'
    },
    {
      name: '2 TV',
      xmltv_id: '2TV.com',
      site_id: '2',
      site: 'example.com',
      lang: undefined,
      logo: undefined
    }
  ])
})

it('can convert object to xmltv string', () => {
  const channels = utils.parseChannels('./tests/input/example.com.channels.xml')
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: '2021-03-19 06:00:00 +0000',
      stop: '2021-03-19 06:30:00 +0000',
      category: 'Test',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv>\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png" /></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category></programme>\r\n</tv>'
  )
})

it('can escape string', () => {
  const string = 'Música тест dun.  &<>"\'\r\n'
  expect(utils.escapeString(string)).toBe('Música тест dun. &amp;&lt;&gt;&quot;&apos;')
})

it('can escape url', () => {
  const string = 'http://example.com/logos/1TV.png?param1=val&param2=val'
  expect(utils.escapeString(string)).toBe(
    'http://example.com/logos/1TV.png?param1=val&amp;param2=val'
  )
})
