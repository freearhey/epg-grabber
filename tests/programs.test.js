import { parse as parsePrograms } from '../src/programs'

const channel = { xmltv_id: '1tv', lang: 'en' }

it('can parse programs', done => {
  const config = {
    parser: () => [
      {
        title: 'Title',
        description: 'Description',
        category: ['Category1', 'Category2'],
        icon: 'https://example.com/image.jpg',
        season: 9,
        episode: 238,
        start: 1640995200,
        stop: 1640998800
      }
    ]
  }

  parsePrograms({ channel, config })
    .then(programs => {
      expect(programs).toMatchObject([
        {
          title: 'Title',
          description: 'Description',
          category: ['Category1', 'Category2'],
          icon: 'https://example.com/image.jpg',
          season: 9,
          episode: 238,
          start: 1640995200,
          stop: 1640998800,
          channel: '1tv'
        }
      ])
      done()
    })
    .catch(done)
})

it('can parse programs async', done => {
  const config = {
    parser: async () => [
      {
        title: 'Title',
        description: 'Description',
        category: ['Category1', 'Category2'],
        icon: 'https://example.com/image.jpg',
        season: 9,
        episode: 238,
        start: 1640995200,
        stop: 1640998800
      }
    ]
  }

  parsePrograms({ channel, config })
    .then(programs => {
      expect(programs.length).toBe(1)
      done()
    })
    .catch(done)
})
