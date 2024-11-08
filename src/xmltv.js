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
        el('channel', { id: channel.xmltv_id }, [
          el('display-name', {}, [escapeString(channel.name)]),
          el('icon', { src: channel.icon }),
          el('url', {}, [escapeString(channel.url)]),
          el('lcn', {}, [escapeString(channel.lcn)])
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
            ...program.subTitles.map(subTitle =>
              el('sub-title', { lang: subTitle.lang }, [escapeString(subTitle.value)])
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
            ...program.keywords.map(keyword =>
              el('keyword', { lang: keyword.lang }, [escapeString(keyword.value)])
            ),
            ...program.languages.map(language =>
              el('language', { lang: language.lang }, [escapeString(language.value)])
            ),
            ...program.origLanguages.map(origLanguage =>
              el('orig-language', { lang: origLanguage.lang }, [escapeString(origLanguage.value)])
            ),
            ...program.length.map(length =>
              el('length', { units: length.units }, [escapeString(length.value)])
            ),
            ...program.countries.map(country =>
              el('country', { lang: country.lang }, [escapeString(country.value)])
            ),
            ...program.urls.map(createURLElement),
            ...program.episodeNumbers.map(episode =>
              el('episode-num', { system: episode.system }, [episode.value])
            ),
            el('video', {}, [
              el('present', {}, [program.video.present]),
              el('colour', {}, [program.video.colour]),
              el('aspect', {}, [program.video.aspect]),
              el('quality', {}, [program.video.quality])
            ]),
            el('audio', {}, [
              el('present', {}, [program.audio.present]),
              el('stereo', {}, [program.audio.stereo])
            ]),
            ...program.previouslyShown.map(previouslyShown =>
              el('previously-shown', {
                start: previouslyShown.start,
                channel: previouslyShown.channel
              })
            ),
            ...program.premiere.map(premiere =>
              el('premiere', { lang: premiere.lang }, [escapeString(premiere.value)])
            ),
            ...program.lastChance.map(lastChance =>
              el('last-chance', { lang: lastChance.lang }, [escapeString(lastChance.value)])
            ),
            program.new ? el('new') : '',
            ...program.subtitles.map(subtitles =>
              el(
                'subtitles',
                { type: subtitles.type },
                subtitles.language.map(language =>
                  el('language', { lang: language.lang }, [escapeString(language.value)])
                )
              )
            ),
            ...program.ratings.map(rating =>
              el('rating', { system: rating.system }, [
                el('value', {}, [escapeString(rating.value)]),
                ...rating.icon.map(icon => el('icon', icon))
              ])
            ),
            ...program.starRatings.map(rating =>
              el('star-rating', { system: rating.system }, [
                el('value', {}, [escapeString(rating.value)]),
                ...rating.icon.map(icon => el('icon', icon))
              ])
            ),
            ...program.reviews.map(review =>
              el(
                'review',
                {
                  type: review.type,
                  source: review.source,
                  reviewer: review.reviewer,
                  lang: review.lang
                },
                [escapeString(review.value)]
              )
            ),
            ...program.images.map(createImageElement),
            ...program.icons.map(icon => el('icon', icon))
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
    ...data.url.map(createURLElement),
    ...data.image.map(createImageElement)
  ])
}

function createImageElement(image) {
  return el(
    'image',
    {
      type: image.type,
      size: image.size,
      orient: image.orient,
      system: image.system
    },
    [escapeString(image.value)]
  )
}

function createURLElement(url) {
  return el('url', { system: url.system }, [escapeString(url.value)])
}

function createElement(name, attrs, children) {
  return toString({ name, attrs, children })
}

function toString(elem) {
  if (typeof elem === 'string' || typeof elem === 'number') return elem
  if (!elem.attrs && !elem.children) return `<${elem.name}/>`

  let attrs = ''
  for (let key in elem.attrs) {
    let value = elem.attrs[key]
    if (value) {
      attrs += ` ${key}="${escapeString(value)}"`
    }
  }

  let children = elem.children || []
  if (children.filter(Boolean).length) {
    let _children = ''
    elem.children.forEach(childElem => {
      _children += toString(childElem)
    })

    return `<${elem.name}${attrs}>${_children}</${elem.name}>`
  }

  if (!attrs) return ''
  if (!['icon', 'previously-shown'].includes(elem.name)) return ''

  return `<${elem.name}${attrs}/>`
}
