import Channel from '../src/Channel'
import Program from '../src/Program'

const channel = new Channel({ xmltv_id: '1tv', lang: 'fr', site: 'example.com' })

it('can create new Program', () => {
  const program = new Program(
    {
      title: 'Title',
      sub_title: 'Subtitle',
      description: 'Description',
      icon: 'https://example.com/image.jpg',
      season: 9,
      episode: 238,
      date: '20220506',
      start: 1616133600000,
      stop: '2021-03-19T06:30:00.000Z',
      url: 'http://example.com/title.html',
      category: ['Category1', 'Category2'],
      rating: {
        system: 'MPAA',
        value: 'PG',
        icon: 'http://example.com/pg_symbol.png'
      },
      directors: 'Director1',
      actors: [
        'Actor1',
        { value: 'Actor2', url: 'http://actor2.com', image: 'http://actor2.com/image.png' }
      ],
      writer: {
        value: 'Writer1',
        url: { system: 'imdb', value: 'http://imdb.com/p/writer1' },
        image: {
          value: 'https://example.com/image.jpg',
          type: 'person',
          size: '2',
          system: 'TestSystem',
          orient: 'P'
        }
      },
      adapters: [
        {
          value: 'Adapter1',
          url: ['http://imdb.com/p/adapter1', 'http://imdb.com/p/adapter2'],
          image: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
        }
      ]
    },
    channel
  )

  expect(program).toMatchObject({
    site: 'example.com',
    channel: '1tv',
    titles: [{ value: 'Title', lang: 'fr' }],
    subTitles: [{ value: 'Subtitle', lang: 'fr' }],
    descriptions: [{ value: 'Description', lang: 'fr' }],
    urls: [{ system: '', value: 'http://example.com/title.html' }],
    categories: [
      { value: 'Category1', lang: 'fr' },
      { value: 'Category2', lang: 'fr' }
    ],
    icons: [{ src: 'https://example.com/image.jpg' }],
    episodeNumbers: [
      { system: 'xmltv_ns', value: '8.237.0/1' },
      { system: 'onscreen', value: 'S09E238' }
    ],
    date: 1651795200000,
    start: 1616133600000,
    stop: 1616135400000,
    ratings: [
      {
        system: 'MPAA',
        value: 'PG',
        icon: [{ src: 'http://example.com/pg_symbol.png' }]
      }
    ],
    directors: [{ value: 'Director1', url: [], image: [] }],
    actors: [
      { value: 'Actor1', url: [], image: [] },
      {
        value: 'Actor2',
        url: [{ system: '', value: 'http://actor2.com' }],
        image: [
          { type: '', size: '', orient: '', system: '', value: 'http://actor2.com/image.png' }
        ]
      }
    ],
    writers: [
      {
        value: 'Writer1',
        url: [{ system: 'imdb', value: 'http://imdb.com/p/writer1' }],
        image: [
          {
            value: 'https://example.com/image.jpg',
            type: 'person',
            size: '2',
            system: 'TestSystem',
            orient: 'P'
          }
        ]
      }
    ],
    adapters: [
      {
        value: 'Adapter1',
        url: [
          { system: '', value: 'http://imdb.com/p/adapter1' },
          { system: '', value: 'http://imdb.com/p/adapter2' }
        ],
        image: [
          {
            value: 'https://example.com/image1.jpg',
            type: '',
            size: '',
            system: '',
            orient: ''
          },
          {
            value: 'https://example.com/image2.jpg',
            type: '',
            size: '',
            system: '',
            orient: ''
          }
        ]
      }
    ],
    producers: [],
    composers: [],
    editors: [],
    presenters: [],
    commentators: [],
    guests: []
  })
})

it('can create program from exist object', () => {
  const program = new Program(
    {
      titles: [{ value: 'Program 1', lang: 'de' }],
      start: '2021-03-19T06:00:00.000Z',
      stop: '2021-03-19T06:30:00.000Z',
      ratings: {
        system: 'MPAA',
        value: 'PG',
        icon: 'http://example.com/pg_symbol.png'
      },
      actors: [{ value: 'Actor1', url: [], image: [] }]
    },
    channel
  )

  expect(program).toMatchObject({
    channel: '1tv',
    titles: [{ value: 'Program 1', lang: 'de' }],
    subTitles: [],
    descriptions: [],
    urls: [],
    categories: [],
    icons: [],
    episodeNumbers: [],
    date: null,
    start: 1616133600000,
    stop: 1616135400000,
    ratings: [
      {
        system: 'MPAA',
        value: 'PG',
        icon: [{ src: 'http://example.com/pg_symbol.png' }]
      }
    ],
    directors: [],
    actors: [{ value: 'Actor1', url: [], image: [] }],
    writers: [],
    adapters: [],
    producers: [],
    composers: [],
    editors: [],
    presenters: [],
    commentators: [],
    guests: []
  })
})

it('can create program without season number', () => {
  const program = new Program(
    {
      title: 'Program 1',
      start: '2021-03-19T06:00:00.000Z',
      stop: '2021-03-19T06:30:00.000Z',
      episode: 238
    },
    channel
  )

  expect(program.episodeNumbers).toMatchObject([
    { system: 'xmltv_ns', value: '0.237.0/1' },
    { system: 'onscreen', value: 'S01E238' }
  ])
})

it('can create program without episode number', () => {
  const program = new Program(
    {
      channel: channel.id,
      title: 'Program 1',
      start: '2021-03-19T06:00:00.000Z',
      stop: '2021-03-19T06:30:00.000Z',
      season: 3
    },
    channel
  )

  expect(program.episodeNumbers).toMatchObject([])
})
