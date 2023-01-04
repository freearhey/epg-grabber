const Channel = require('./Channel')
const Program = require('./Program')
const { escapeString, getUTCDate, formatDate, isDate } = require('./utils')
const el = createElement

module.exports.generate = generate

function generate({ channels, programs, date = getUTCDate() }) {
  if (!channels.every(c => c instanceof Channel)) {
    throw new Error('"channels" must be an array of Channels')
  }

  if (!programs.every(p => p instanceof Program)) {
    throw new Error('"programs" must be an array of Programs')
  }

  if (!isDate(date)) {
    throw new Error('"date" must be a valid date')
  }

  let output = `<?xml version="1.0" encoding="UTF-8" ?>`
  output += createElements(channels, programs, date)

  return output
}

function createElements(channels, programs, date) {
  return el('tv', { date: formatDate(date, 'YYYYMMDD') }, [
    ...channels.map(channel => {
      return (
        '\r\n' +
        el('channel', { id: channel.id }, [
          el('display-name', {}, [escapeString(channel.name)]),
          el('icon', { src: channel.logo }),
          el('url', {}, [channel.url])
        ])
      )
    }),
    ...programs.map(program => {
      return (
        '\r\n' +
        el(
          'programme',
          {
            start: formatDate(program.start, 'YYYYMMDDHHmmss ZZ'),
            stop: formatDate(program.stop, 'YYYYMMDDHHmmss ZZ'),
            channel: program.channel
          },
          [
            ...program.titles.map(title =>
              el('title', { lang: title.lang }, [escapeString(title.value)])
            ),
            ...program.sub_titles.map(sub_title =>
              el('sub-title', { lang: sub_title.lang }, [escapeString(sub_title.value)])
            ),
            ...program.descriptions.map(desc =>
              el('desc', { lang: desc.lang }, [escapeString(desc.value)])
            ),
            el('credits', {}, [
              ...program.directors.map(data => createCastMember('director', data)),
              ...program.actors.map(data => createCastMember('actor', data)),
              ...program.writers.map(data => createCastMember('writer', data)),
              ...program.adapters.map(data => createCastMember('adapter', data)),
              ...program.producers.map(data => createCastMember('producer', data)),
              ...program.composers.map(data => createCastMember('composer', data)),
              ...program.editors.map(data => createCastMember('editor', data)),
              ...program.presenters.map(data => createCastMember('presenter', data)),
              ...program.commentators.map(data => createCastMember('commentator', data)),
              ...program.guests.map(data => createCastMember('guest', data))
            ]),
            el('date', {}, [formatDate(program.date, 'YYYYMMDD')]),
            ...program.categories.map(category =>
              el('category', { lang: category.lang }, [escapeString(category.value)])
            ),
            el('icon', { src: program.icon.src }),
            ...program.urls.map(createURL),
            ...program.episodeNumbers.map(episode =>
              el('episode-num', { system: episode.system }, [episode.value])
            ),
            ...program.ratings.map(rating =>
              el('rating', { system: rating.system }, [
                el('value', {}, [escapeString(rating.value)]),
                el('icon', { src: rating.icon })
              ])
            )
          ]
        )
      )
    }),
    '\r\n'
  ])
}

function createCastMember(position, data) {
  return el(position, {}, [
    escapeString(data.value),
    ...data.url.map(createURL),
    ...data.image.map(createImage)
  ])
}

function createImage(image) {
  return el(
    'image',
    {
      type: image.type,
      size: image.size,
      orient: image.orient,
      system: image.system
    },
    [image.value]
  )
}

function createURL(url) {
  return el('url', { system: url.system }, [url.value])
}

function createElement(name, attrs = {}, children = []) {
  return toString({ name, attrs, children })
}

function toString(elem) {
  if (typeof elem === 'string' || typeof elem === 'number') return elem

  let attrs = ''
  for (let key in elem.attrs) {
    let value = elem.attrs[key]
    if (value) {
      attrs += ` ${key}="${escapeString(value)}"`
    }
  }

  if (elem.children.filter(Boolean).length) {
    let children = ''
    elem.children.forEach(childElem => {
      children += toString(childElem)
    })

    return `<${elem.name}${attrs}>${children}</${elem.name}>`
  }

  if (!attrs) return ''
  if (!['icon'].includes(elem.name)) return ''

  return `<${elem.name}${attrs}/>`
}
