import xmltv from '../src/xmltv'

jest.useFakeTimers('modern').setSystemTime(new Date('2022-05-05'))

const channels = [
  {
    xmltv_id: '1TV.com',
    name: '1 TV',
    logo: 'https://example.com/logos/1TV.png',
    site: 'example.com'
  },
  {
    xmltv_id: '2TV.com',
    name: '2 TV',
    site: 'example.com'
  }
]

it('can generate xmltv', () => {
  const programs = [
    {
      title: 'Program 1',
      sub_title: 'Sub-title & 1',
      description: 'Description for Program 1',
      url: 'http://example.com/title.html',
      start: 1616133600,
      stop: 1616135400,
      category: 'Test',
      season: 9,
      episode: 239,
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it',
      date: '20220505',
      director: {
        value: 'Director 1',
        url: { value: 'http://example.com/director1.html', system: 'TestSystem' }
      },
      actor: ['Actor 1', 'Actor 2'],
      writer: 'Writer 1'
    }
  ]
  const output = xmltv.generate({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><sub-title>Sub-title &amp; 1</sub-title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><url>http://example.com/title.html</url><episode-num system="xmltv_ns">8.238.0/1</episode-num><episode-num system="onscreen">S09E239</episode-num><date>20220505</date><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/><credits><director>Director 1<url system="TestSystem">http://example.com/director1.html</url></director><actor>Actor 1</actor><actor>Actor 2</actor><writer>Writer 1</writer></credits></programme>\r\n</tv>'
  )
})

it('can generate xmltv without season number', () => {
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
  const output = xmltv.generate({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><episode-num system="xmltv_ns">0.238.0/1</episode-num><episode-num system="onscreen">S01E239</episode-num><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can generate xmltv without episode number', () => {
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
  const output = xmltv.generate({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can generate xmltv without categories', () => {
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
  const output = xmltv.generate({ config, channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title></programme>\r\n</tv>'
  )
})

it('can generate xmltv with multiple categories', () => {
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
  const output = xmltv.generate({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test1</category><category lang="it">Test2</category><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can generate xmltv with multiple urls', () => {
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: ['Test1', 'Test2'],
      url: [
        'https://example.com/noattr.html',
        { value: 'https://example.com/attr.html', system: 'TestSystem' }
      ],
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = xmltv.generate({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test1</category><category lang="it">Test2</category><url>https://example.com/noattr.html</url><url system="TestSystem">https://example.com/attr.html</url><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n</tv>'
  )
})

it('can generate xmltv with multiple images', () => {
  const programs = [
    {
      title: 'Program 1',
      description: 'Description for Program 1',
      start: 1616133600,
      stop: 1616135400,
      category: ['Test1', 'Test2'],
      url: [
        'https://example.com/noattr.html',
        { value: 'https://example.com/attr.html', system: 'TestSystem' }
      ],
      actor: {
        value: 'Actor 1',
        image: [
          'https://example.com/image1.jpg',
          {
            value: 'https://example.com/image2.jpg',
            type: 'person',
            size: '2',
            system: 'TestSystem',
            orient: 'P'
          }
        ]
      },
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it'
    }
  ]
  const output = xmltv.generate({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><desc lang="it">Description for Program 1</desc><category lang="it">Test1</category><category lang="it">Test2</category><url>https://example.com/noattr.html</url><url system="TestSystem">https://example.com/attr.html</url><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/><credits><actor>Actor 1<image>https://example.com/image1.jpg</image><image type="person" size="2" orient="P" system="TestSystem">https://example.com/image2.jpg</image></actor></credits></programme>\r\n</tv>'
  )
})

it('can generate xmltv with multiple credits member', () => {
  const programs = [
    {
      title: 'Program 1',
      sub_title: 'Sub-title 1',
      description: 'Description for Program 1',
      url: 'http://example.com/title.html',
      start: 1616133600,
      stop: 1616135400,
      category: 'Test',
      season: 9,
      episode: 239,
      icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
      channel: '1TV.com',
      lang: 'it',
      date: '20220505',
      director: {
        value: 'Director 1',
        url: { value: 'http://example.com/director1.html', system: 'TestSystem' }
      },
      actor: {
        value: 'Actor 1',
        role: 'Manny',
        guest: 'yes',
        url: { value: 'http://example.com/actor1.html', system: 'TestSystem' }
      },
      writer: [
        { value: 'Writer 1', url: { value: 'http://example.com/w1.html', system: 'TestSystem' } },
        { value: 'Writer 2', url: { value: 'http://example.com/w2.html', system: 'TestSystem' } }
      ]
    }
  ]
  const output = xmltv.generate({ channels, programs })
  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.com"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.com"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.com"><title lang="it">Program 1</title><sub-title>Sub-title 1</sub-title><desc lang="it">Description for Program 1</desc><category lang="it">Test</category><url>http://example.com/title.html</url><episode-num system="xmltv_ns">8.238.0/1</episode-num><episode-num system="onscreen">S09E239</episode-num><date>20220505</date><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/><credits><director>Director 1<url system="TestSystem">http://example.com/director1.html</url></director><actor role="Manny" guest="yes">Actor 1<url system="TestSystem">http://example.com/actor1.html</url></actor><writer>Writer 1<url system="TestSystem">http://example.com/w1.html</url></writer><writer>Writer 2<url system="TestSystem">http://example.com/w2.html</url></writer></credits></programme>\r\n</tv>'
  )
})
