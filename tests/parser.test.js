import { parseChannels, parsePrograms } from '../src/parser'
import Channel from '../src/Channel'
import Program from '../src/Program'
import fs from 'fs'

it('can parse channels.xml', () => {
  const file = fs.readFileSync('./tests/__data__/input/example.channels.xml', {
    encoding: 'utf-8'
  })
  const channels = parseChannels(file)

  expect(channels.length).toBe(2)
  expect(channels[0]).toBeInstanceOf(Channel)
  expect(channels[1]).toBeInstanceOf(Channel)
  expect(channels[0]).toMatchObject({
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.com',
    lang: 'fr',
    icon: 'https://example.com/logos/1TV.png',
    name: '1 TV'
  })
  expect(channels[1]).toMatchObject({
    site: 'example.com',
    site_id: '2',
    lang: '',
    icon: '',
    xmltv_id: '2TV.com',
    name: '2 TV'
  })
})

it('can parse channels.xml with inline site attribute', () => {
  const file = fs.readFileSync('./tests/__data__/input/example_3.channels.xml', {
    encoding: 'utf-8'
  })
  const channels = parseChannels(file)

  expect(channels.length).toBe(2)
  expect(channels[0]).toBeInstanceOf(Channel)
  expect(channels[1]).toBeInstanceOf(Channel)
  expect(channels[0]).toMatchObject({
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.com',
    lang: 'fr',
    icon: 'https://example.com/logos/1TV.png',
    name: '1 TV'
  })
  expect(channels[1]).toMatchObject({
    site: 'example.com',
    site_id: '2',
    lang: '',
    icon: '',
    xmltv_id: '2TV.com',
    name: '2 TV'
  })
})

it('can parse legacy channels.xml', () => {
  const file = fs.readFileSync('./tests/__data__/input/legacy.channels.xml', { encoding: 'utf-8' })
  const channels = parseChannels(file)

  expect(channels.length).toBe(2)
  expect(channels[0]).toBeInstanceOf(Channel)
  expect(channels[1]).toBeInstanceOf(Channel)
  expect(channels[0]).toMatchObject({
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.com',
    lang: 'fr',
    icon: 'https://example.com/logos/1TV.png',
    name: '1 TV'
  })
  expect(channels[1]).toMatchObject({
    site: 'example.com',
    site_id: '2',
    lang: '',
    icon: '',
    xmltv_id: '2TV.com',
    name: '2 TV'
  })
})

it('can parse programs', done => {
  const channel = new Channel({ xmltv_id: '1tv' })
  const config = require('./__data__/input/example.config.js')

  parsePrograms({ channel, config })
    .then(programs => {
      expect(programs.length).toBe(1)
      expect(programs[0]).toBeInstanceOf(Program)
      done()
    })
    .catch(done)
})

it('can parse programs async', done => {
  const channel = new Channel({ xmltv_id: '1tv' })
  const config = require('./__data__/input/async.config.js')

  parsePrograms({ channel, config })
    .then(programs => {
      expect(programs.length).toBe(1)
      expect(programs[0]).toBeInstanceOf(Program)
      done()
    })
    .catch(done)
})
