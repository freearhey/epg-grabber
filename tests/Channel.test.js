import Channel from '../src/Channel'

it('can create new Channel', () => {
  const channel = new Channel({
    name: '1 TV',
    xmltv_id: '1TV.com',
    site_id: '1',
    site: 'example.com',
    lang: 'fr',
    logo: 'https://example.com/logos/1TV.png'
  })

  expect(channel).toMatchObject({
    name: '1 TV',
    id: '1TV.com',
    site_id: '1',
    site: 'example.com',
    url: 'https://example.com',
    lang: 'fr',
    logo: 'https://example.com/logos/1TV.png'
  })
})

it('can create channel from exist object', () => {
  const channel = new Channel({
    name: '1 TV',
    id: '1TV.com',
    site_id: '1',
    site: 'example.com',
    lang: 'fr',
    logo: 'https://example.com/logos/1TV.png'
  })

  expect(channel).toMatchObject({
    name: '1 TV',
    id: '1TV.com',
    site_id: '1',
    site: 'example.com',
    url: 'https://example.com',
    lang: 'fr',
    logo: 'https://example.com/logos/1TV.png'
  })
})
