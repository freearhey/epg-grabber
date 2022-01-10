import mockAxios from 'jest-mock-axios'
import utils from '../src/utils'
import path from 'path'
import fs from 'fs'

it('can load valid config.js', () => {
  const config = utils.loadConfig(require(path.resolve('./tests/input/example.com.config.js')))
  expect(config).toMatchObject({
    days: 1,
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

it('can parse valid channels.xml', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const channels = utils.parseChannels(file)
  expect(channels).toEqual([
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
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const channels = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: 'Test',
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv>\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string without categories', () => {
  const channels = [
    {
      name: '1 TV',
      xmltv_id: '1TV.com',
      site_id: '1',
      site: 'example.com',
      lang: 'fr',
      logo: 'https://example.com/logos/1TV.png'
    }
  ]
  const programs = [
    {
      title: 'Program 1',
      start: 1616133600,
      stop: 1616135400,
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const config = { site: 'example.com' }
  const output = utils.convertToXMLTV({ config, channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv>\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string with multiple categories', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const channels = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: ['Test1', 'Test2'],
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv>\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test1</category><category lang="it">Test2</category><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
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

it('can fetch data', () => {
  const request = {
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
    withCredentials: true
  }
  utils.fetchData(request).then(jest.fn).catch(jest.fn)
  expect(mockAxios).toHaveBeenCalledWith(
    expect.objectContaining({
      data: { accountID: '123' },
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'abc=123',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71'
      },
      method: 'POST',
      responseType: 'arraybuffer',
      timeout: 5000,
      url: 'http://example.com/20210319/1tv.json',
      withCredentials: true
    })
  )
})

it('can build request async', done => {
  const config = utils.loadConfig(require(path.resolve('./tests/input/async.config.js')))
  return utils.buildRequest({}, config).then(request => {
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
      withCredentials: true
    })
    done()
  })
})

it('can load logo async', done => {
  const config = utils.loadConfig(require(path.resolve('./tests/input/async.config.js')))
  return utils.loadLogo({}, config).then(logo => {
    expect(logo).toBe('http://example.com/logos/1TV.png?x=шеллы&sid=777')
    done()
  })
})

it('can parse programs async', done => {
  const config = utils.loadConfig(require(path.resolve('./tests/input/async.config.js')))
  return utils
    .parsePrograms({ channel: { xmltv_id: '1tv', lang: 'en' } }, config)
    .then(programs => {
      expect(programs.length).toBe(0)
      done()
    })
})
