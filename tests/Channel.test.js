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
    displayNames: [{ lang: 'fr', value: '1 TV' }],
    xmltv_id: '1TV.com',
    site_id: '1',
    site: 'example.com',
    urls: [{ system: '', value: 'https://example.com' }],
    lang: 'fr',
    icons: [{ src: 'https://example.com/logos/1TV.png' }]
  })
})
