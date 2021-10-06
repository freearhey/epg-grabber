/**
 * @jest-environment node
 */

import grabber from '../src/index'
import utils from '../src/utils'
import axios from 'axios'
import path from 'path'

jest.mock('axios')

it('can grab single channel programs', done => {
  const data = {
    data: {
      toString: () => 'string'
    }
  }
  axios.mockImplementation(() => Promise.resolve(data))

  const config = utils.loadConfig(require(path.resolve('./tests/input/mini.config.js')))
  const channel = {
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.fr',
    lang: 'fr',
    name: '1TV'
  }
  grabber
    .grab(channel, config, (data, err) => {
      if (err) {
        console.log(`    Error: ${err.message}`)
        done()
      } else {
        console.log(
          `  ${data.channel.site} - ${data.channel.xmltv_id} - ${data.date.format(
            'MMM D, YYYY'
          )} (${data.programs.length} programs)`
        )
      }
    })
    .then(programs => {
      expect(programs.length).toBe(0)
      done()
    })
})
