/**
 * @jest-environment node
 */

import { it, expect, beforeAll, afterAll, afterEach, beforeEach, describe, vi, test } from 'vitest'
import { EPGGrabber, EPGGrabberMock } from '../src/index'
import { SiteConfig } from '../src/types/siteConfig'
import * as epgGrabber from '../src/index'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import path from 'node:path'
import fs from 'fs-extra'

describe('EPGGrabber', () => {
  describe('grab()', () => {
    const restHandlers = [
      http.get('http://example.com/20210319/1tv.json', () => {
        return HttpResponse.json([{ title: 'Program1', start: '2021-03-19T04:30:00.000Z' }])
      })
    ]

    const server = setupServer(...restHandlers)

    beforeAll(async () => {
      server.listen({ onUnhandledRequest: 'error' })
    })
    beforeEach(() => vi.useFakeTimers())
    afterAll(() => server.close())
    afterEach(() => server.resetHandlers())

    it('can use global config', async () => {
      const config: SiteConfig = {
        site: 'example.com',
        url: 'http://example.com/20210319/1tv.json',
        parser: ({ content }) => (content ? JSON.parse(content) : [])
      }

      const channel = new epgGrabber.Channel({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.fr',
        lang: 'fr',
        name: '1TV',
        logo: null,
        url: null,
        lcn: null,
        index: -1
      })

      const grabber = new EPGGrabber(config)
      const promise = grabber.grab(channel, '2022-01-01', (context, error) => {
        if (error) throw error
      })

      vi.advanceTimersByTime(3000)

      const programs = await promise

      expect(programs.length).toBe(1)
      expect(programs[0].toObject()).toMatchObject({
        site: 'example.com',
        channel: '1TV.fr',
        titles: [{ value: 'Program1', lang: 'fr' }],
        subTitles: [],
        descriptions: [],
        icons: [],
        episodeNumbers: [],
        date: 0,
        start: 1616128200000,
        stop: 0,
        urls: [],
        ratings: [],
        categories: [],
        directors: [],
        actors: [],
        writers: [],
        adapters: [],
        audio: {},
        video: {},
        images: [],
        keywords: [],
        languages: [],
        lastChance: [],
        length: [],
        new: false,
        origLanguages: [],
        premiere: [],
        previouslyShown: [],
        reviews: [],
        starRatings: [],
        subtitles: [],
        countries: [],
        producers: [],
        composers: [],
        editors: [],
        presenters: [],
        commentators: [],
        guests: []
      })
    })

    it('can use local configs', async () => {
      const config: SiteConfig = {
        site: 'example.com',
        url: 'http://example.com/20210319/1tv.json',
        parser: ({ content }) => (content ? JSON.parse(content) : [])
      }

      const channel = new epgGrabber.Channel({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.fr',
        lang: 'fr',
        name: '1TV',
        logo: null,
        url: null,
        lcn: null,
        index: -1
      })

      const grabber = new EPGGrabber()
      const promise = grabber.grab(channel, '2022-01-01', config, (context, error) => {
        if (error) throw error
      })

      vi.advanceTimersByTime(3000)

      const programs = await promise

      expect(programs[0].titles).toMatchObject([
        {
          lang: 'fr',
          value: 'Program1'
        }
      ])
    })
  })

  describe('loadLogo()', () => {
    it('can load logo for channel', async () => {
      const config: SiteConfig = {
        site: 'example.com',
        url: 'http://example.com/20210319/1tv.json',
        parser: ({ content }) => (content ? JSON.parse(content) : []),
        logo: ({ channel }) => `https://example.com/logos/${channel.xmltv_id}`
      }

      const channel = new epgGrabber.Channel({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.fr',
        lang: 'fr',
        name: '1TV',
        logo: null,
        url: null,
        lcn: null,
        index: -1
      })

      const grabber = new EPGGrabber()
      const logo = await grabber.loadLogo(channel, '2022-01-01', config)

      expect(logo).toBe('https://example.com/logos/1TV.fr')
    })
  })

  describe('parseChannelsXML()', () => {
    it('can parse channels.xml', () => {
      const xml = fs.readFileSync(
        path.resolve(__dirname, './__data__/input/example.channels.xml'),
        'utf-8'
      )
      const channels = EPGGrabber.parseChannelsXML(xml)

      expect(channels.length).toBe(2)
      expect(channels[0]).toBeInstanceOf(epgGrabber.Channel)
      expect(channels[1]).toBeInstanceOf(epgGrabber.Channel)
      expect(channels[0].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.com',
        lang: 'fr',
        logo: 'https://example.com/logos/1TV.png',
        name: '1 TV',
        index: 0,
        lcn: '36'
      })
      expect(channels[1].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '2',
        lang: null,
        logo: null,
        xmltv_id: '2TV.com',
        name: '2 TV',
        index: 1
      })
    })

    it('can parse channels.xml with inline site attribute', () => {
      const xml = fs.readFileSync(
        path.resolve(__dirname, './__data__/input/example_3.channels.xml'),
        'utf-8'
      )
      const channels = EPGGrabber.parseChannelsXML(xml)

      expect(channels.length).toBe(2)
      expect(channels[0]).toBeInstanceOf(epgGrabber.Channel)
      expect(channels[1]).toBeInstanceOf(epgGrabber.Channel)
      expect(channels[0].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.com',
        lang: 'fr',
        logo: 'https://example.com/logos/1TV.png',
        name: '1 TV'
      })
      expect(channels[1].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '2',
        lang: null,
        logo: null,
        xmltv_id: '2TV.com',
        name: '2 TV'
      })
    })

    it('can parse legacy channels.xml', () => {
      const xml = fs.readFileSync(
        path.resolve(__dirname, './__data__/input/legacy.channels.xml'),
        'utf-8'
      )
      const channels = EPGGrabber.parseChannelsXML(xml)

      expect(channels.length).toBe(2)
      expect(channels[0]).toBeInstanceOf(epgGrabber.Channel)
      expect(channels[1]).toBeInstanceOf(epgGrabber.Channel)
      expect(channels[0].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.com',
        lang: 'fr',
        logo: 'https://example.com/logos/1TV.png',
        name: '1 TV'
      })
      expect(channels[1].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '2',
        lang: null,
        logo: null,
        xmltv_id: '2TV.com',
        name: '2 TV'
      })
    })
  })

  describe('generateXMLTV()', () => {
    vi.useFakeTimers().setSystemTime(new Date('2022-05-05'))

    const channels = [
      new epgGrabber.Channel({
        xmltv_id: '1TV.co',
        name: '1 TV',
        site: 'example.com',
        logo: 'https://example.com/channel_one_icon.jpg',
        index: 1,
        url: 'https://example.com/channel_one?foo=foo&bar=bar',
        lcn: '36',
        site_id: '#',
        lang: null
      }),
      new epgGrabber.Channel({
        xmltv_id: '2TV.co',
        name: '2 TV',
        site: 'example.com',
        site_id: '#',
        url: null,
        lcn: null,
        index: 2,
        lang: 'es',
        logo: 'https://example.com/logos/2TV.png'
      }),
      new epgGrabber.Channel({
        xmltv_id: '3TV.co',
        name: '3 TV',
        site: 'example.com',
        site_id: '#',
        url: null,
        lcn: null,
        lang: null,
        logo: null,
        index: 3
      })
    ]

    it('can generate xmltv', () => {
      const programs = [
        new epgGrabber.Program({
          site: 'example.com',
          channel: '1TV.co',
          start: 1616133600000,
          stop: 1616135400000,
          titles: [{ value: 'Program 1' }],
          subTitles: [{ value: 'Sub-title & 1' }],
          descriptions: [{ value: 'Description for Program 1' }],
          date: 1651795200000,
          categories: [{ value: 'Test' }],
          keywords: [
            { lang: 'en', value: 'physical-comedy' },
            { lang: 'en', value: 'romantic' }
          ],
          languages: [{ value: 'English' }],
          origLanguages: [{ lang: 'en', value: 'French' }],
          length: [{ units: 'minutes', value: '60' }],
          urls: [{ value: 'http://example.com/title.html' }],
          countries: [{ value: 'US' }],
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
          episodeNumbers: [
            { system: 'xmltv_ns', value: '8.238.0/1' },
            { system: 'onscreen', value: 'S09E239' }
          ],
          previouslyShown: [{ start: '', channel: '' }],
          premiere: [{ value: 'First time on British TV' }],
          lastChance: [{ lang: 'en', value: 'Last time on this channel' }],
          new: true,
          subtitles: [
            { type: 'teletext', language: [{ value: 'English' }] },
            { type: 'onscreen', language: [{ lang: 'en', value: 'Spanish' }] }
          ],
          ratings: [
            {
              system: 'MPAA',
              value: 'P&G',
              icons: [{ src: 'http://example.com/pg_symbol.png' }]
            }
          ],
          starRatings: [
            {
              system: 'TV Guide',
              value: '4/5',
              icons: [{ src: 'stars.png' }]
            },
            {
              system: 'IMDB',
              value: '8/10',
              icons: []
            }
          ],
          reviews: [
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
          directors: [
            {
              value: 'Director 1',
              urls: [{ value: 'http://example.com/director1.html', system: 'TestSystem' }],
              images: [
                { value: 'https://example.com/image1.jpg' },
                {
                  value: 'https://example.com/image2.jpg',
                  type: 'person',
                  size: '2',
                  system: 'TestSystem',
                  orient: 'P'
                }
              ]
            },
            {
              value: 'Director 2',
              urls: [],
              images: []
            }
          ],
          actors: [
            { value: 'Actor 1', urls: [], images: [] },
            { value: 'Actor 2', urls: [], images: [] }
          ],
          writers: [{ value: 'Writer 1', urls: [], images: [] }],
          images: [
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
          icons: [{ src: 'https://example.com/images/Program1.png?x=шеллы&sid=777' }]
        }),
        new epgGrabber.Program({
          site: 'example.com',
          channel: '2TV.co',
          titles: [{ lang: 'es', value: 'Program 2' }],
          start: 1616133600000,
          stop: 1616135400000
        })
      ]

      const output = EPGGrabber.generateXMLTV(channels, programs)

      expect(output).toBe(
        '<?xml version="1.0" encoding="UTF-8" ?><tv date="20220505">\r\n<channel id="1TV.co"><display-name>1 TV</display-name><icon src="https://example.com/channel_one_icon.jpg"/><url>https://example.com/channel_one?foo=foo&amp;bar=bar</url><lcn>36</lcn></channel>\r\n<channel id="2TV.co"><display-name>2 TV</display-name><icon src="https://example.com/logos/2TV.png"/><url>https://example.com</url></channel>\r\n<channel id="3TV.co"><display-name>3 TV</display-name><url>https://example.com</url></channel>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="1TV.co"><title>Program 1</title><sub-title>Sub-title &amp; 1</sub-title><desc>Description for Program 1</desc><credits><director>Director 1<url system="TestSystem">http://example.com/director1.html</url><image>https://example.com/image1.jpg</image><image type="person" size="2" orient="P" system="TestSystem">https://example.com/image2.jpg</image></director><director>Director 2</director><actor>Actor 1</actor><actor>Actor 2</actor><writer>Writer 1</writer></credits><date>20220506</date><category>Test</category><keyword lang="en">physical-comedy</keyword><keyword lang="en">romantic</keyword><language>English</language><orig-language lang="en">French</orig-language><length units="minutes">60</length><country>US</country><url>http://example.com/title.html</url><episode-num system="xmltv_ns">8.238.0/1</episode-num><episode-num system="onscreen">S09E239</episode-num><video><present>yes</present><colour>no</colour><aspect>16:9</aspect><quality>HDTV</quality></video><audio><present>yes</present><stereo>Dolby Digital</stereo></audio><previously-shown/><premiere>First time on British TV</premiere><last-chance lang="en">Last time on this channel</last-chance><new/><subtitles type="teletext"><language>English</language></subtitles><subtitles type="onscreen"><language lang="en">Spanish</language></subtitles><rating system="MPAA"><value>P&amp;G</value><icon src="http://example.com/pg_symbol.png"/></rating><star-rating system="TV Guide"><value>4/5</value><icon src="stars.png"/></star-rating><star-rating system="IMDB"><value>8/10</value></star-rating><review type="text" source="Rotten Tomatoes" reviewer="Joe Bloggs" lang="en">This is a fantastic show!</review><review type="text" source="IDMB" reviewer="Jane Doe" lang="en">I love this show!</review><review type="url" source="Rotten Tomatoes" reviewer="Joe Bloggs" lang="en">https://example.com/programme_one_review</review><image type="poster" size="1" orient="P" system="tvdb">https://tvdb.com/programme_one_poster_1.jpg?foo=foo&amp;bar=bar</image><image type="poster" size="2" orient="P" system="tmdb">https://tmdb.com/programme_one_poster_2.jpg</image><image type="backdrop" size="3" orient="L" system="tvdb">https://tvdb.com/programme_one_backdrop_3.jpg</image><image type="backdrop" size="3" orient="L" system="tmdb">https://tmdb.com/programme_one_backdrop_3.jpg</image><icon src="https://example.com/images/Program1.png?x=шеллы&amp;sid=777"/></programme>\r\n<programme start="20210319060000 +0000" stop="20210319063000 +0000" channel="2TV.co"><title lang="es">Program 2</title></programme>\r\n</tv>'
      )
    })
  })
})

describe('EPGGrabberMock', () => {
  test('grab()', async () => {
    const config: SiteConfig = {
      site: 'example.com',
      url: 'http://example.com/20210319/1tv.json',
      parser: ({ content }) => (content ? JSON.parse(content) : [])
    }

    const channel = new epgGrabber.Channel({
      site: 'example.com',
      site_id: '1',
      xmltv_id: '1TV.fr',
      lang: 'fr',
      name: '1TV',
      logo: null,
      url: null,
      lcn: null,
      index: -1
    })

    const grabber = new EPGGrabberMock(config)
    const programs = await grabber.grab(channel, '2022-01-01', (context, error) => {
      if (error) throw error
    })

    expect(programs.length).toBe(0)
  })
})
