import { parse as parseChannels } from '../src/channels'
import path from 'path'
import fs from 'fs'

it('can parse valid channels.xml', () => {
  const file = fs.readFileSync('./tests/input/example.com.channels.xml', { encoding: 'utf-8' })
  const { channels } = parseChannels(file)
  expect(channels).toEqual([
    {
      name: '1 TV',
      xmltv_id: '1TV.com',
      site_id: '1',
      site: 'example.com',
      lang: 'fr',
      logo: 'https://example.com/logos/1TV.png'
    },
    {
      name: '2 TV',
      xmltv_id: '2TV.com',
      site_id: '2',
      site: 'example.com',
      lang: undefined,
      logo: undefined
    }
  ])
})
