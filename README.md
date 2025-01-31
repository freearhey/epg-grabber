# EPG Grabber [![test](https://github.com/freearhey/epg-grabber/actions/workflows/test.yml/badge.svg)](https://github.com/freearhey/epg-grabber/actions/workflows/test.yml)

Node.js CLI tool for grabbing EPG from different websites.

## Installation

```sh
npm install -g epg-grabber
```

## Quick Start

```sh
epg-grabber --config=example.com.config.js
```

#### example.com.config.js

```js
module.exports = {
  site: 'example.com',
  channels: 'example.com.channels.xml',
  url: function (context) {
    const { date, channel } = context

    return `https://api.example.com/${date.format('YYYY-MM-DD')}/channel/${channel.site_id}`
  },
  parser: function (context) {
    const programs = JSON.parse(context.content)

    return programs.map(program => {
      return {
        title: program.title,
        start: program.start,
        stop: program.stop
      }
    })
  }
}
```

#### example.com.channels.xml

```xml
<?xml version="1.0" ?>
<channels site="example.com">
  <channel site_id="cnn-23" xmltv_id="CNN.us">CNN</channel>
</channels>
```

## Example Output

```xml
<tv>
  <channel id="CNN.us">
    <display-name>CNN</display-name>
    <url>https://example.com</url>
  </channel>
  <programme start="20211116040000 +0000" stop="20211116050000 +0000" channel="CNN.us">
    <title lang="en">News at 10PM</title>
  </programme>
  // ...
</tv>
```

## CLI

```sh
epg-grabber --config=example.com.config.js
```

Arguments:

- `-c, --config`: path to config file
- `-o, --output`: path to output file or path template (example: `guides/{site}.{lang}.xml`; default: `guide.xml`)
- `-x, --proxy`: use the specified proxy
- `--channels`: path to list of channels; you can also use wildcard to specify the path to multiple files at once (example: `example.com_*.channels.xml`)
- `--lang`: set default language for all programs (default: `en`)
- `--days`: number of days for which to grab the program (default: `1`)
- `--delay`: delay between requests in milliseconds (default: `3000`)
- `--timeout`: set a timeout for each request in milliseconds (default: `5000`)
- `--max-connections`: set a limit on the number of concurrent requests per site (default: `1`)
- `--cache-ttl`: maximum time for storing each request in milliseconds (default: `0`)
- `--gzip`: compress the output (default: `false`)
- `--debug`: enable debug mode (default: `false`)
- `--curl`: display current request as CURL (default: `false`)
- `--log`: path to log file (optional)
- `--log-level`: set the log level (default: `info`)

## Site Config

```js
module.exports = {
  site: 'example.com', // site domain name (required)
  output: 'example.com.guide.xml', // path to output file or path template (example: 'guides/{site}.{lang}.xml'; default: 'guide.xml')
  channels: 'example.com.channels.xml', // path to list of channels; you can also use an array to specify the path to multiple files at once (example: ['channels1.xml', 'channels2.xml']; required)
  lang: 'fr', // default language for all programs (default: 'en')
  days: 3, // number of days for which to grab the program (default: 1)
  delay: 5000, // delay between requests (default: 3000)
  maxConnections: 200, // limit on the number of concurrent requests (default: 1)

  request: { // request options (details: https://github.com/axios/axios#request-config)

    method: 'GET',
    timeout: 5000,
    proxy: {
      protocol: 'https',
      host: '127.0.0.1',
      port: 9000,
      auth: {
        username: 'mikeymike',
        password: 'rapunz3l'
      }
    },
    cache: { // cache options (details: https://axios-cache-interceptor.js.org/#/pages/per-request-configuration)
      ttl: 60 * 1000 // 60s
    },

    /**
     * @param {object} context
     *
     * @return {string} The function should return headers for each request (optional)
     */
    headers: function(context) {
      return {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71'
      }
    },

    /**
     * @param {object} context
     *
     * @return {string} The function should return data for each request (optional)
     */
    data: function(context) {
      const { channel, date } = context

      return {
        channels: [channel.site_id],
        dateStart: date.format('YYYY-MM-DDT00:00:00-00:00'),
        dateEnd: date.add(1, 'd').format('YYYY-MM-DDT00:00:00-00:00')
      }
    }
  },

  /**
   * @param {object} context
   *
   * @return {string} The function should return URL of the program page for the channel
   */
  url: function (context) {
    return `https://example.com/${context.date.format('YYYY-MM-DD')}/channel/${context.channel.site_id}.html`
  },

  /**
   * @param {object} context
   *
   * @return {string} The function should return URL of the channel logo (optional)
   */
  logo: function (context) {
    return `https://example.com/logos/${context.channel.site_id}.png`
  },

  /**
   * @param {object} context
   *
   * @return {array} The function should return an array of programs with their descriptions
   */
  parser: function (context) {

    // content parsing...

    return [
      {
        title,
        start,
        stop
      },
      ...
    ]
  }
}
```

## Context Object

From each function in `config.js` you can access a `context` object containing the following data:

- `channel`: The object describing the current channel (xmltv_id, site_id, name, lang)
- `date`: The 'dayjs' instance with the requested date
- `content`: The response data as a String
- `buffer`: The response data as an ArrayBuffer
- `headers`: The response headers
- `request`: The request config
- `cached`: A boolean to check whether this request was cached or not

## Program Object

| Property        | Aliases                          | Type                                             | Required |
| --------------- | -------------------------------- | ------------------------------------------------ | -------- |
| start           |                                  | `String` or `Number` or `Date()`                 | true     |
| stop            |                                  | `String` or `Number` or `Date()`                 | true     |
| title           | titles                           | `String` or `Object` or `String[]` or `Object[]` | true     |
| subTitle        | subTitles, sub_title, sub_titles | `String` or `Object` or `String[]` or `Object[]` | false    |
| description     | desc, descriptions               | `String` or `Object` or `String[]` or `Object[]` | false    |
| date            |                                  | `String` or `Number` or `Date()`                 | false    |
| category        | categories                       | `String` or `Object` or `String[]` or `Object[]` | false    |
| keyword         | keywords                         | `String` or `Object` or `String[]` or `Object[]` | false    |
| language        | languages                        | `String` or `Object` or `String[]` or `Object[]` | false    |
| origLanguage    | origLanguages                    | `String` or `Object` or `String[]` or `Object[]` | false    |
| length          |                                  | `String` or `Object` or `String[]` or `Object[]` | false    |
| url             | urls                             | `String` or `Object` or `String[]` or `Object[]` | false    |
| country         | countries                        | `String` or `Object` or `String[]` or `Object[]` | false    |
| video           |                                  | `Object`                                         | false    |
| audio           |                                  | `Object`                                         | false    |
| season          |                                  | `String` or `Number`                             | false    |
| episode         |                                  | `String` or `Number`                             | false    |
| episodeNumber   | episodeNum, episodeNumbers       | `Object`                                         | false    |
| previouslyShown |                                  | `String` or `Object` or `String[]` or `Object[]` | false    |
| premiere        |                                  | `String` or `Object` or `String[]` or `Object[]` | false    |
| lastChance      |                                  | `String` or `Object` or `String[]` or `Object[]` | false    |
| new             |                                  | `Boolean`                                        | false    |
| subtitles       |                                  | `Object` or `Object[]`                           | false    |
| rating          | ratings                          | `String` or `Object` or `String[]` or `Object[]` | false    |
| starRating      | starRatings                      | `String` or `Object` or `String[]` or `Object[]` | false    |
| review          | reviews                          | `String` or `Object` or `String[]` or `Object[]` | false    |
| director        | directors                        | `String` or `Object` or `String[]` or `Object[]` | false    |
| actor           | actors                           | `String` or `Object` or `String[]` or `Object[]` | false    |
| writer          | writers                          | `String` or `Object` or `String[]` or `Object[]` | false    |
| adapter         | adapters                         | `String` or `Object` or `String[]` or `Object[]` | false    |
| producer        | producers                        | `String` or `Object` or `String[]` or `Object[]` | false    |
| presenter       | presenters                       | `String` or `Object` or `String[]` or `Object[]` | false    |
| composer        | composers                        | `String` or `Object` or `String[]` or `Object[]` | false    |
| editor          | editors                          | `String` or `Object` or `String[]` or `Object[]` | false    |
| commentator     | commentators                     | `String` or `Object` or `String[]` or `Object[]` | false    |
| guest           | guests                           | `String` or `Object` or `String[]` or `Object[]` | false    |
| image           | images                           | `String` or `Object` or `String[]` or `Object[]` | false    |
| icon            | icons                            | `String` or `Object` or `String[]` or `Object[]` | false    |

Example:

```js
{
  start: '2021-03-19T06:00:00.000Z',
  stop: '2021-03-19T06:30:00.000Z',
  title: 'Program 1',
  subTitle: 'Sub-title & 1',
  description: 'Description for Program 1',
  date: '2022-05-06',
  categories: ['Comedy', 'Drama'],
  keywords: [
    { lang: 'en', value: 'physical-comedy' },
    { lang: 'en', value: 'romantic' }
  ],
  language: 'English',
  origLanguage: { lang: 'en', value: 'French' },
  length: { units: 'minutes', value: '60' },
  url: 'http://example.com/title.html',
  country: 'US',
  video: {
    present: 'yes',
    colour: 'no',
    aspect: '16:9',
    quality: 'HDTV'
  },
  audio: {
    present: 'yes',
    stereo: 'Dolby Digital'
  },
  season: 9,
  episode: 239,
  previouslyShown: [{ start: '20080711000000', channel: 'channel-two.tv' }],
  premiere: 'First time on British TV',
  lastChance: [{ lang: 'en', value: 'Last time on this channel' }],
  new: true,
  subtitles: [
    { type: 'teletext', language: 'English' },
    { type: 'onscreen', language: [{ lang: 'en', value: 'Spanish' }] }
  ],
  rating: {
    system: 'MPAA',
    value: 'P&G',
    icon: 'http://example.com/pg_symbol.png'
  },
  starRatings: [
    {
      system: 'TV Guide',
      value: '4/5',
      icon: [{ src: 'stars.png', width: 100, height: 100 }]
    },
    {
      system: 'IMDB',
      value: '8/10'
    }
  ],
  reviews: [
    {
      type: 'text',
      source: 'Rotten Tomatoes',
      reviewer: 'Joe Bloggs',
      lang: 'en',
      value: 'This is a fantastic show!'
    },
    {
      type: 'text',
      source: 'IDMB',
      reviewer: 'Jane Doe',
      lang: 'en',
      value: 'I love this show!'
    },
    {
      type: 'url',
      source: 'Rotten Tomatoes',
      reviewer: 'Joe Bloggs',
      lang: 'en',
      value: 'https://example.com/programme_one_review'
    }
  ],
  directors: [
    {
      value: 'Director 1',
      url: { value: 'http://example.com/director1.html', system: 'TestSystem' },
      image: [
        'https://example.com/image1.jpg',
        {
          value: 'https://example.com/image2.jpg',
          type: 'person',
          size: '2',
          system: 'TestSystem',
          orient: 'P'
        }
      ]
    },
    'Director 2'
  ],
  actors: ['Actor 1', 'Actor 2'],
  writer: 'Writer 1',
  producers: 'Roger Dobkowitz',
  presenters: 'Drew Carey',
  images: [
    {
      type: 'poster',
      size: '1',
      orient: 'P',
      system: 'tvdb',
      value: 'https://tvdb.com/programme_one_poster_1.jpg'
    },
    {
      type: 'poster',
      size: '2',
      orient: 'P',
      system: 'tmdb',
      value: 'https://tmdb.com/programme_one_poster_2.jpg'
    },
    {
      type: 'backdrop',
      size: '3',
      orient: 'L',
      system: 'tvdb',
      value: 'https://tvdb.com/programme_one_backdrop_3.jpg'
    }
  ],
  icon: 'https://example.com/images/Program1.png?x=шеллы&sid=777'
}
```

## Channels List

```xml
<?xml version="1.0" ?>
<channels site="example.com">
  <channel site_id="cnn-23" xmltv_id="CNN.us">CNN</channel>
  ...
</channels>
```

You can also specify the language, site, url, logo and LCN (Logical Channel Number) for each channel individually, like so:

```xml
<channel
  site="example.com"
  site_id="france-24"
  xmltv_id="France24.fr"
  lang="fr"
  logo="https://example.com/france24.png"
  url="https://example.com/"
  lcn="36"
>France 24</channel>
```

## How to use SOCKS proxy?

```
epg-grabber --config=example.com.config.js --proxy=socks://localhost:9050
```

## Contribution

If you find a bug or want to contribute to the code or documentation, you can help by submitting an [issue](https://github.com/freearhey/epg-grabber/issues) or a [pull request](https://github.com/freearhey/epg-grabber/pulls).

## License

[MIT](http://opensource.org/licenses/MIT)
