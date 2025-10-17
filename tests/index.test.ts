/**
 * @jest-environment node
 */

import { it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { SiteConfigProps } from '../src/types/siteConfig'
import { EPGGrabber, Channel } from '../src/index'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const restHandlers = [
  http.get('http://example.com/20210319/1tv.json', () => {
    return HttpResponse.json([{ title: 'Program1', start: '2021-03-19T04:30:00.000Z' }])
  })
]

const server = setupServer(...restHandlers)

beforeAll(async () => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterAll(() => server.close())
beforeEach(() => {})
afterEach(() => server.resetHandlers())

it('can use global config', async () => {
  const config: SiteConfigProps = {
    site: 'example.com',
    url: 'http://example.com/20210319/1tv.json',
    parser: ({ content }) => (content ? JSON.parse(content) : []),
    filepath: 'example.config.js'
  }

  const channel = new Channel({
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
  const programs = await grabber.grab(channel, '2022-01-01', (context, error) => {
    if (error) throw error
  })

  expect(programs.length).toBe(1)
  expect(programs[0].toObject()).toMatchObject({
    site: 'example.com',
    channel: '1TV.fr',
    titles: [{ value: 'Program1', lang: 'fr' }],
    subTitles: [],
    descriptions: [],
    icons: [],
    episodeNumbers: [],
    date: null,
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
  const config: SiteConfigProps = {
    site: 'example.com',
    url: 'http://example.com/20210319/1tv.json',
    parser: ({ content }) => (content ? JSON.parse(content) : []),
    filepath: 'example.config.js'
  }

  const channel = new Channel({
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
  const programs = await grabber.grab(channel, '2022-01-01', config, (context, error) => {
    if (error) throw error
  })
  expect(programs[0].titles).toMatchObject([
    {
      lang: 'fr',
      value: 'Program1'
    }
  ])
})
