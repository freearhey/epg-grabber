import Channel from '../src/Channel'
import Program from '../src/Program'
import xmltv from '../src/xmltv'

jest.useFakeTimers('modern').setSystemTime(new Date('2022-05-05'))

const channels = [
  new Channel({
    xmltv_id: '1TV.co',
    name: '1 TV',
    site: 'example.com',
    icon: 'https://example.com/channel_one_icon.jpg',
    url: 'https://example.com/channel_one?foo=foo&bar=bar',
    lcn: 36
  }),
  new Channel({
    xmltv_id: '2TV.co',
    name: '2 TV',
    site: 'example.com',
    lang: 'es',
    logo: 'https://example.com/logos/2TV.png'
  })
]

it('can generate xmltv', () => {
  const programs = [
    new Program(
      {
        start: '2021-03-19T06:00:00.000Z',
        stop: '2021-03-19T06:30:00.000Z',
        title: 'Program 1',
        subTitle: 'Sub-title & 1',
        description: 'Description for Program 1',
        date: '2022-05-06',
        category: 'Test',
        keyword: [
          { lang: 'en', value: 'physical-comedy' },
          { lang: 'en', value: 'romantic' }
        ],
        language: [{ value: 'English' }],
        origLanguage: [{ lang: 'en', value: 'French' }],
        length: [{ units: 'minutes', value: '60' }],
        url: 'http://example.com/title.html',
        country: [{ value: 'US' }],
        video: {
          present: 'yes',
          colour: 'no',
          aspect: '16:9',
          quality: 'HDTV'
        },
        audio: {
          present: 'yes',
          stereo: 'Dolby Digital'
        },
        season: 9,
        episode: 239,
        previouslyShown: [{ start: '20080711000000', channel: 'channel-two.tv' }],
        premiere: [{ value: 'First time on British TV' }],
        lastChance: [{ lang: 'en', value: 'Last time on this channel' }],
        new: true,
        subtitles: [
          { type: 'teletext', language: [{ value: 'English' }] },
          { type: 'onscreen', language: [{ lang: 'en', value: 'Spanish' }] }
        ],
        rating: {
          system: 'MPAA',
          value: 'P&G',
          icon: 'http://example.com/pg_symbol.png'
        },
        starRating: [
          {
            system: 'TV Guide',
            value: '4/5',
            icon: [{ src: 'stars.png' }]
          },
          {
            system: 'IMDB',
            value: '8/10'
          }
        ],
        review: [
          {
            type: 'text',
            source: 'Rotten Tomatoes',
            reviewer: 'Joe Bloggs',
            lang: 'en',
            value: 'This is a fantastic show!'
          },
          {
            type: 'text',
            source: 'IDMB',
            reviewer: 'Jane Doe',
            lang: 'en',
            value: 'I love this show!'
          },
          {
            type: 'url',
            source: 'Rotten Tomatoes',
            reviewer: 'Joe Bloggs',
            lang: 'en',
            value: 'https://example.com/programme_one_review'
          }
        ],
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
        writer: 'Writer 1',
        image: [
          {
            type: 'poster',
            size: '1',
            orient: 'P',
            system: 'tvdb',
            value: 'https://tvdb.com/programme_one_poster_1.jpg?foo=foo&bar=bar'
          },
          {
            type: 'poster',
            size: '2',
            orient: 'P',
            system: 'tmdb',
            value: 'https://tmdb.com/programme_one_poster_2.jpg'
          },
          {
            type: 'backdrop',
            size: '3',
            orient: 'L',
            system: 'tvdb',
            value: 'https://tvdb.com/programme_one_backdrop_3.jpg'
          },
          {
            type: 'backdrop',
            size: '3',
            orient: 'L',
            system: 'tmdb',
            value: 'https://tmdb.com/programme_one_backdrop_3.jpg'
          }
        ],
        icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777'
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
    '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.co"><display-name>1 TV</display-name><icon src="https://example.com/channel_one_icon.jpg"/><url>https://example.com/channel_one?foo=foo&amp;bar=bar</url><lcn>36</lcn></channel>\r\n<channel id="2TV.co"><display-name>2 TV</display-name><icon src="https://example.com/logos/2TV.png"/><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.co"><title>Program 1</title><sub-title>Sub-title &amp; 1</sub-title><desc>Description for Program 1</desc><credits><director>Director 1<url system="TestSystem">http://example.com/director1.html</url><image>https://example.com/image1.jpg</image><image type="person" size="2" orient="P" system="TestSystem">https://example.com/image2.jpg</image></director><director>Director 2</director><actor>Actor 1</actor><actor>Actor 2</actor><writer>Writer 1</writer></credits><date>20220506</date><category>Test</category><keyword lang="en">physical-comedy</keyword><keyword lang="en">romantic</keyword><language>English</language><orig-language lang="en">French</orig-language><length units="minutes">60</length><country>US</country><url>http://example.com/title.html</url><episode-num system="xmltv_ns">8.238.0/1</episode-num><episode-num system="onscreen">S09E239</episode-num><video><present>yes</present><colour>no</colour><aspect>16:9</aspect><quality>HDTV</quality></video><audio><present>yes</present><stereo>Dolby Digital</stereo></audio><previously-shown start="20080711000000" channel="channel-two.tv"/><premiere>First time on British TV</premiere><last-chance lang="en">Last time on this channel</last-chance><new/><subtitles type="teletext"><language>English</language></subtitles><subtitles type="onscreen"><language lang="en">Spanish</language></subtitles><rating system="MPAA"><value>P&amp;G</value><icon src="http://example.com/pg_symbol.png"/></rating><star-rating system="TV Guide"><value>4/5</value><icon src="stars.png"/></star-rating><star-rating system="IMDB"><value>8/10</value></star-rating><review type="text" source="Rotten Tomatoes" reviewer="Joe Bloggs" lang="en">This is a fantastic show!</review><review type="text" source="IDMB" reviewer="Jane Doe" lang="en">I love this show!</review><review type="url" source="Rotten Tomatoes" reviewer="Joe Bloggs" lang="en">https://example.com/programme_one_review</review><image type="poster" size="1" orient="P" system="tvdb">https://tvdb.com/programme_one_poster_1.jpg?foo=foo&amp;bar=bar</image><image type="poster" size="2" orient="P" system="tmdb">https://tmdb.com/programme_one_poster_2.jpg</image><image type="backdrop" size="3" orient="L" system="tvdb">https://tvdb.com/programme_one_backdrop_3.jpg</image><image type="backdrop" size="3" orient="L" system="tmdb">https://tmdb.com/programme_one_backdrop_3.jpg</image><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="2TV.co"><title lang="es">Program 2</title></programme>\r\n</tv>'
  )
})
