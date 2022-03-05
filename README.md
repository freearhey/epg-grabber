# EPG Grabber [![Build Status](https://app.travis-ci.com/freearhey/epg-grabber.svg?branch=master)](https://app.travis-ci.com/freearhey/epg-grabber)

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
<site site="example.com">
  <channels>
    <channel site_id="cnn-23" xmltv_id="CNN.us">CNN</channel>
  </channels>
</site>
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
- `-o, --output`: path to output file (default: 'guide.xml')
- `--channels`: path to list of channels (can be specified via config file)
- `--lang`: set default language for all programs (default: 'en')
- `--days`: number of days for which to grab the program (default: 1)
- `--delay`: delay between requests (default: 3000)
- `--timeout`: set a timeout for each request (default: 5000)
- `--debug`: enable debug mode (default: false)
- `--log`: path to log file (optional)
- `--log-level`: set the log level (default: 'info')

## Site Config

```js
module.exports = {
  site: 'example.com', // site domain name (required)
  output: 'example.com.guide.xml', // path to output file (default: 'guide.xml')
  channels: 'example.com.channels.xml', // path to channels.xml file (required)
  lang: 'fr', // default language for all programs (default: 'en')
  days: 3, // number of days for which to grab the program (default: 1)
  delay: 5000, // delay between requests (default: 3000)

  request: { // request options (details: https://github.com/axios/axios#request-config)

    method: 'GET',
    timeout: 5000,

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
        title, // program title (required)
        start, // start time of the program (required)
        stop, // end time of the program (required)
        description, // description of the program (optional)
        category, // program type (optional)
        season, // season number (optional)
        episode, // episode number (optional)
        icon, // image associated with the program (optional)
        lang // language of the description (default: 'en')
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

## Channels List

```xml
<?xml version="1.0" ?>
<site site="example.com">
  <channels>
    <channel site_id="cnn-23" xmltv_id="CNN.us">CNN</channel>
    ...
  </channels>
</site>
```

You can also specify the language and logo for each channel individually, like so:

```xml
<channel
  site_id="france-24"
  xmltv_id="France24.fr"
  lang="fr"
  logo="https://example.com/france24.png"
>France 24</channel>
```

## Contribution

If you find a bug or want to contribute to the code or documentation, you can help by submitting an [issue](https://github.com/freearhey/epg-grabber/issues) or a [pull request](https://github.com/freearhey/epg-grabber/pulls).

## License

[MIT](http://opensource.org/licenses/MIT)
