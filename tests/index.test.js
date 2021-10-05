/**
 * @jest-environment node
 */

import grabber from '../src/index'
import utils from '../src/utils'
import axios from 'axios'

jest.mock('axios')

it('can grab single channel programs', done => {
  const data = {
    data: {
      toString: () => 'string'
    }
  }
  axios.mockImplementation(() => Promise.resolve(data))

  const config = utils.loadConfig({ config: './tests/input/mini.config.js' })
  const channel = {
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.fr',
    lang: 'fr',
    name: '1TV'
  }
  grabber.grab(channel, config, result => {
    result.on('data', function (data) {
      console.log(
        `  ${data.channel.site} - ${data.channel.xmltv_id} - ${data.date.format('MMM D, YYYY')} (${
          data.programs.length
        } programs)`
      )
    })

    result.on('error', function (err) {
      console.log(`    Error: ${err.message}`)
      done()
    })

    result.on('done', function (programs) {
      expect(programs.length).toBe(0)
      done()
    })
  })
})
