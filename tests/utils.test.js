import mockAxios from 'jest-mock-axios'
import utils from '../src/utils'
import axios from 'axios'
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
  const { channels } = utils.parseChannels(file)
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
  const { channels } = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      sub_title : 'Sub-title 1',
      description: 'Description for Program 1',
      url : 'http://example.com/title.html',
      start: 1616133600,
      stop: 1616135400,
      category: 'Test',
      season: 9,
      episode: 239,
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it',
      date: '20220505',
      director: {value:'Director 1', url:{value: 'http://example.com/director1.html', system: 'TestSystem'}},
      actor: ['Actor 1', 'Actor 2'],
      writer: 'Writer 1'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><sub-title>Sub-title 1</sub-title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><url>http://example.com/title.html</url><episode-num system="xmltv_ns">8.238.0/1</episode-num><episode-num system="onscreen">S09E239</episode-num><date>20220505</date><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/><credits><director>Director 1<url system="TestSystem">http://example.com/director1.html</url></director><actor>Actor 1</actor><actor>Actor 2</actor><writer>Writer 1</writer></credits></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string without season number', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const { channels } = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: 'Test',
      episode: 239,
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><episode-num system="xmltv_ns">0.238.0/1</episode-num><episode-num system="onscreen">S01E239</episode-num><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string without episode number', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const { channels } = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: 'Test',
      season: 1,
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
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
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string with multiple categories', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const { channels } = utils.parseChannels(file)
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
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test1</category><category lang="it">Test2</category><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string with multiple urls', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const { channels } = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: ['Test1', 'Test2'],
      url:['https://example.com/noattr.html',{value:'https://example.com/attr.html', system:'TestSystem'}],
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test1</category><category lang="it">Test2</category><url>https://example.com/noattr.html</url><url system="TestSystem">https://example.com/attr.html</url><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string with multiple images', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const { channels } = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: ['Test1', 'Test2'],
      url:['https://example.com/noattr.html',{value:'https://example.com/attr.html', system:'TestSystem'}],
      actor:{value:'Actor 1', image:['https://example.com/image1.jpg',{value:'https://example.com/image2.jpg',type:'person',size:'2',system:'TestSystem',orient:'P'}]},
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test1</category><category lang="it">Test2</category><url>https://example.com/noattr.html</url><url system="TestSystem">https://example.com/attr.html</url><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/><credits><actor>Actor 1<image>https://example.com/image1.jpg</image><image type="person" size="2" orient="P" system="TestSystem">https://example.com/image2.jpg</image></actor></credits></programme>\r\n</tv>'
  )
})

it('can convert object to xmltv string with multiple credits member', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const { channels } = utils.parseChannels(file)
  const programs = [
    {
      title: 'Program 1',
      sub_title : 'Sub-title 1',
      description: 'Description for Program 1',
      url : 'http://example.com/title.html',
      start: 1616133600,
      stop: 1616135400,
      category: 'Test',
      season: 9,
      episode: 239,
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it',
      date: '20220505',
      director: {value:'Director 1', url:{value: 'http://example.com/director1.html', system: 'TestSystem'}},
      actor: {value:'Actor 1', role:'Manny', guest:'yes', url:{value: 'http://example.com/actor1.html', system: 'TestSystem'}},
      writer: [{value:'Writer 1', url:{value: 'http://example.com/w1.html', system: 'TestSystem'}},{value:'Writer 2', url:{value: 'http://example.com/w2.html', system: 'TestSystem'}}]
    }
  ]
  const output = utils.convertToXMLTV({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><sub-title>Sub-title 1</sub-title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><url>http://example.com/title.html</url><episode-num system="xmltv_ns">8.238.0/1</episode-num><episode-num system="onscreen">S09E239</episode-num><date>20220505</date><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/><credits><director>Director 1<url system="TestSystem">http://example.com/director1.html</url></director><actor role="Manny" guest="yes">Actor 1<url system="TestSystem">http://example.com/actor1.html</url></actor><writer>Writer 1<url system="TestSystem">http://example.com/w1.html</url></writer><writer>Writer 2<url system="TestSystem">http://example.com/w2.html</url></writer></credits></programme>\r\n</tv>'
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
  utils.fetchData(mockAxios, request).then(jest.fn).catch(jest.fn)
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

  utils
    .buildRequest({}, config)
    .then(request => {
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
    .catch(done)
})

it('can load logo async', done => {
  const config = utils.loadConfig(require(path.resolve('./tests/input/async.config.js')))

  utils
    .loadLogo({}, config)
    .then(logo => {
      expect(logo).toBe('http://example.com/logos/1TV.png?x=шеллы&sid=777')
      done()
    })
    .catch(done)
})

it('can parse programs', done => {
  const config = utils.loadConfig(require(path.resolve('./tests/input/example.com.config.js')))

  utils
    .parsePrograms({ channel: { xmltv_id: '1tv', lang: 'en' } }, config)
    .then(programs => {
      expect(programs).toMatchObject([
        {
          title: 'Title',
          description: 'Description',
          lang: 'en',
          category: ['Category1', 'Category2'],
          icon: 'https://example.com/image.jpg',
          season: 9,
          episode: 238,
          start: 1640995200,
          stop: 1640998800
        }
      ])
      done()
    })
    .catch(done)
})

it('can parse programs async', done => {
  const config = utils.loadConfig(require(path.resolve('./tests/input/async.config.js')))

  utils
    .parsePrograms({ channel: { xmltv_id: '1tv', lang: 'en' } }, config)
    .then(programs => {
      expect(programs.length).toBe(0)
      done()
    })
    .catch(done)
})
