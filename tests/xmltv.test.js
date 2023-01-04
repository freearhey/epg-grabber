import Channel from '../src/Channel'
import Program from '../src/Program'
import xmltv from '../src/xmltv'

jest.useFakeTimers('modern').setSystemTime(new Date('2022-05-05'))

const channels = [
  new Channel({
    xmltv_id: '1TV.co',
    name: '1 TV',
    logo: 'https://example.com/logos/1TV.png',
    site: 'example.com'
  }),
  new Channel({
    xmltv_id: '2TV.co',
    name: '2 TV',
    site: 'example.com',
    lang: 'es'
  })
]

it('can generate xmltv', () => {
  const programs = [
    new Program(
      {
        title: 'Program 1',
        sub_title: 'Sub-title & 1',
        description: 'Description for Program 1',
        url: 'http://example.com/title.html',
        start: '2021-03-19T06:00:00.000Z',
        stop: '2021-03-19T06:30:00.000Z',
        category: 'Test',
        date: '2022-05-06',
        season: 9,
        episode: 239,
        icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777',
        rating: {
          system: 'MPAA',
          value: 'P&G',
          icon: 'http://example.com/pg_symbol.png'
        },
        director: [
          {
            value: 'Director 1',
            url: { value: 'http://example.com/director1.html', system: 'TestSystem' },
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
          'Director 2'
        ],
        actor: ['Actor 1', 'Actor 2'],
        writer: 'Writer 1'
      },
      channels[0]
    ),
    new Program(
      {
        title: 'Program 2',
        start: '2021-03-19T06:00:00.000Z',
        stop: '2021-03-19T06:30:00.000Z'
      },
      channels[1]
    )
  ]

  const output = xmltv.generate({ channels, programs })

  expect(output).toBe(
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.co"><display-name>1 TV</display-name><icon src="https://example.com/logos/1TV.png"/><url>https://example.com</url></channel>\r\n<channel id="2TV.co"><display-name>2 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.co"><title>Program 1</title><sub-title>Sub-title &amp; 1</sub-title><desc>Description for Program 1</desc><credits><director>Director 1<url system="TestSystem">http://example.com/director1.html</url><image>https://example.com/image1.jpg</image><image type="person" size="2" orient="P" system="TestSystem">https://example.com/image2.jpg</image></director><director>Director 2</director><actor>Actor 1</actor><actor>Actor 2</actor><writer>Writer 1</writer></credits><date>20220506</date><category>Test</category><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/><url>http://example.com/title.html</url><episode-num system="xmltv_ns">8.238.0/1</episode-num><episode-num system="onscreen">S09E239</episode-num><rating system="MPAA"><value>P&amp;G</value><icon src="http://example.com/pg_symbol.png"/></rating></programme>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="2TV.co"><title lang="es">Program 2</title></programme>\r\n</tv>'
  )
})
