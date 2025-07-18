/**
 * @jest-environment node
 */

import { EPGGrabber, EPGGrabberMock, Channel } from '../src/index'
import axios from 'axios'

jest.mock('axios')

it('can grab single channel programs', done => {
  const data = {
    data: {
      toString: () => '[{"title":"Program1"}]'
    }
  }
  axios.mockImplementation(() => Promise.resolve(data))

  const config = {
    site: 'example.com',
    url: 'http://example.com/20210319/1tv.json',
    parser: ({ content }) => JSON.parse(content)
  }
  const channel = new Channel({
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.fr',
    lang: 'fr',
    name: '1TV'
  })
  const grabber = new EPGGrabber(config)
  grabber
    .grab(channel, '2022-01-01')
    .then(programs => {
      expect(programs[0].titles).toMatchObject([
        {
          lang: 'fr',
          value: 'Program1'
        }
      ])
      done()
    })
    .catch(done)
})

it('can use a different config for different requests', done => {
  const data = {
    data: {
      toString: () => '[{"title":"Program1"}]'
    }
  }
  axios.mockImplementation(() => Promise.resolve(data))

  const config = {
    site: 'example.com',
    url: 'http://example.com/20210319/1tv.json',
    parser: ({ content }) => JSON.parse(content)
  }
  const channel = new Channel({
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.fr',
    lang: 'fr',
    name: '1TV'
  })
  const grabber = new EPGGrabber()
  grabber
    .grab(channel, '2022-01-01', config, (data, err) => {
      if (err) {
        done(err)
      }
    })
    .then(programs => {
      expect(programs[0].titles).toMatchObject([
        {
          lang: 'fr',
          value: 'Program1'
        }
      ])
      done()
    })
})

it('can mock epg grabber', done => {
  const config = {
    site: 'example.com',
    url: 'http://example.com/20210319/1tv.json',
    parser: ({ channel, date }) => [
      { title: `Test (${channel.name})`, start: '2021-03-19T04:30:00.000Z' }
    ]
  }
  const channel = new Channel({
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.fr',
    lang: 'fr',
    name: '1TV'
  })
  const grabber = new EPGGrabberMock(config)
  grabber
    .grab(channel, '2022-01-01', (data, err) => {
      if (err) {
        done()
      }
    })
    .then(programs => {
      expect(programs.length).toBe(1)
      expect(programs).toEqual([
        {
          site: 'example.com',
          channel: '1TV.fr',
          titles: [{ value: 'Test (1TV)', lang: 'fr' }],
          subTitles: [],
          descriptions: [],
          icons: [],
          episodeNumbers: [],
          date: null,
          start: 1616128200000,
          stop: null,
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
          new: undefined,
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
        }
      ])
      done()
    })
})
