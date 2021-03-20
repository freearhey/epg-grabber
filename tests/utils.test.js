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
      site: 'example.com'
    },
    {
      name: '2 TV',
      xmltv_id: '2TV.com',
      site_id: '2',
      site: 'example.com'
    }
  ])
})

it('can convert object to xmltv string', () => {
  const config = { lang: 'en' }
  const channels = [
    {
      name: '1 TV',
      xmltv_id: '1TV.com',
      site_id: '1',
      site: 'example.com',
      logo: 'http://example.com/logos/1TV.png'
    },
    {
      name: '2 TV',
      xmltv_id: '2TV.com',
      site_id: '2',
      site: 'example.com'
    }
  ]
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: '2021-03-19 06:00:00 +0000',
      stop: '2021-03-19 06:30:00 +0000',
      category: 'Test',
      channel: '1TV.com'
    }
  ]
  const output = utils.convertToXMLTV({ config, channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv>\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="http://example.com/logos/1TV.png" /></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="en">Program 1</title><desc lang="en">Description for Program 1</desc><category lang="en">Test</category></programme>\r\n</tv>'
  )
})

it('can escape string', () => {
  const string = 'Música тест dun.  &<>"\'\r\n'
  expect(utils.escapeString(string)).toBe('Música тест dun. &amp;&lt;&gt;&quot;&apos;')
})
