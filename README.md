# EPG Grabber [![Build Status](https://travis-ci.com/freearhey/epg-grabber.svg?branch=master)](https://travis-ci.com/freearhey/epg-grabber)

Node.js CLI tool for grabbing EPG from different websites.

## Installation

```sh
npm install -g epg-grabber
```

## Usage

```sh
epg-grabber --config=example.com.config.js
```

Arguments:

- `-c, --config`: path to config file
- `-d, --debug`: enable debug mode

#### example.com.config.js

```js
module.exports = {
  lang: 'fr', // default language for all programs (default: 'en')
  site: 'example.com', // site domain name (required)
  output: 'example.com.guide.xml', // path to output file (default: 'guide.xml')
  channels: 'example.com.channels.xml', // path to channels.xml file (required)

  request: { // request options (details: https://github.com/axios/axios#request-config)

    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71',
    },
    timeout: 5000

  },

  /**
   * @param {object} date The 'dayjs' instance with the requested date
   * @param {object} channel Data about the requested channel
   *
   * @return {string} The function should return URL of the program page for the channel
   */
  url: function ({ date, channel }) {
    return `https://example.com/${date.format('YYYY-MM-DD')}/channel/${channel.site_id}.html`
  },

  /**
   * @param {object} channel Data about the requested channel
   * @param {string} content The response received after the request at the above url
   *
   * @return {string} The function should return URL of the channel logo (optional)
   */
  logo: function ({ channel, content }) {
    return `https://example.com/logos/${channel.site_id}.png`
  },

  /**
   * @param {string} content The response received after the request at the above url
   *
   * @return {array} The function should return an array of programs with their descriptions
   */
  parser: function ({ content }) {

    // content parsing...

    return [
      {
        title, // program title (required)
        start, // program start time (required)
        stop, // program end time (optional)
        description, // program description (optional)
        category, // program category (optional)
        icon, // program icon (optional)
        lang // program language (default: 'en')
      },
      ...
    ]
  }
}
```

#### example.com.channels.xml

```xml
<?xml version="1.0"?>
<site site="example.com">
  <channels>
    <channel site_id="cnn-23" xmltv_id="CNN.us">CNN</channel>
    ...
  </channels>
</site>
```

You can also specify the language and logo for each channel individually, like so:

```xml
<channel site_id="france-24" xmltv_id="France24.fr" lang="fr" logo="https://example.com/france24.png">France 24</channel>
```

## Contribution

If you find a bug or want to contribute to the code or documentation, you can help by submitting an [issue](https://github.com/freearhey/epg-grabber/issues) or a [pull request](https://github.com/freearhey/epg-grabber/pulls).

## License

[MIT](http://opensource.org/licenses/MIT)
