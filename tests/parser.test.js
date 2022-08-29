import { parseChannels, parsePrograms } from '../src/parser'
import Channel from '../src/Channel'
import Program from '../src/Program'
import fs from 'fs'

it('can parse valid channels.xml', () => {
  const file = fs.readFileSync('./tests/__data__/input/example.channels.xml', { encoding: 'utf-8' })
  const { channels, site } = parseChannels(file)

  expect(typeof site).toBe('string')
  expect(channels.length).toBe(2)
  expect(channels[0]).toBeInstanceOf(Channel)
  expect(channels[1]).toBeInstanceOf(Channel)
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
