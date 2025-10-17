import { Channel } from '../../src/models/channel'
import { it, expect } from 'vitest'

it('can create new Channel', () => {
  const channel = new Channel({
    name: '1 TV',
    xmltv_id: '1TV.com',
    site_id: '1',
    site: 'example.com',
    lang: 'fr',
    url: 'https://example.com',
    logo: 'https://example.com/logos/1TV.png',
    lcn: '36',
    index: 2
  })

  expect(channel.toObject()).toMatchObject({
    name: '1 TV',
    xmltv_id: '1TV.com',
    site_id: '1',
    site: 'example.com',
    url: 'https://example.com',
    lang: 'fr',
    logo: 'https://example.com/logos/1TV.png',
    lcn: '36',
    index: 2
  })
})
