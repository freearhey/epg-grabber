const { padStart } = require('lodash')
const { toArray, toUnix, parseNumber } = require('./utils')
const Channel = require('./Channel')

class Program {
  constructor(p, c) {
    if (!(c instanceof Channel)) {
      throw new Error('The second argument in the constructor must be the "Channel" class')
    }

    const data = {
      start: p.start ? toUnix(p.start) : null,
      stop: p.stop ? toUnix(p.stop) : null,
      channel: c.xmltv_id || '',
      titles: toArray(p.titles || p.title).map(text => toTextObject(text, c.lang)),
      subTitles: toArray(p.subTitles || p.subTitle || p.sub_titles || p.sub_title).map(text =>
        toTextObject(text, c.lang)
      ),
      descriptions: toArray(p.descriptions || p.description || p.desc).map(text =>
        toTextObject(text, c.lang)
      ),
      date: p.date ? toUnix(p.date) : null,
      categories: toArray(p.categories || p.category).map(text => toTextObject(text, c.lang)),
      keywords: toArray(p.keywords || p.keyword).map(text => toTextObject(text, c.lang)),
      languages: toArray(p.languages || p.language).map(text => toTextObject(text, c.lang)),
      origLanguages: toArray(p.origLanguages || p.origLanguage).map(text =>
        toTextObject(text, c.lang)
      ),
      length: toArray(p.length).map(toLengthObject),
      urls: toArray(p.urls || p.url).map(toUrlObject),
      countries: toArray(p.countries || p.country).map(text => toTextObject(text, c.lang)),
      site: c.site || '',
      episodeNumbers: toArray(
        p.episodeNum ||
          p.episodeNumber ||
          p.episodeNumbers ||
          makeEpisodeNumberObjects(p.season, p.episode)
      ).map(toEpisodeNumberObject),
      video: toVideoObject(p.video),
      audio: toAudioObject(p.audio),
      previouslyShown: toArray(p.previouslyShown).map(toPreviouslyShownObject),
      premiere: toArray(p.premiere).map(toTextObject),
      lastChance: toArray(p.lastChance).map(toTextObject),
      new: p.new,
      subtitles: toArray(p.subtitles).map(toSubtitlesObject),
      ratings: toArray(p.ratings || p.rating).map(toRatingObject),
      starRatings: toArray(p.starRatings || p.starRating).map(toRatingObject),
      reviews: toArray(p.reviews || p.review).map(toReviewObject),
      directors: toArray(p.directors || p.director).map(toPersonObject),
      actors: toArray(p.actors || p.actor).map(toPersonObject),
      writers: toArray(p.writers || p.writer).map(toPersonObject),
      adapters: toArray(p.adapters || p.adapter).map(toPersonObject),
      producers: toArray(p.producers || p.producer).map(toPersonObject),
      composers: toArray(p.composers || p.composer).map(toPersonObject),
      editors: toArray(p.editors || p.editor).map(toPersonObject),
      presenters: toArray(p.presenters || p.presenter).map(toPersonObject),
      commentators: toArray(p.commentators || p.commentator).map(toPersonObject),
      guests: toArray(p.guests || p.guest).map(toPersonObject),
      images: toArray(p.images || p.image).map(toImageObject),
      icons: toArray(p.icons || p.icon).map(toIconObject)
    }

    for (let key in data) {
      this[key] = data[key]
    }
  }
}

module.exports = Program

function toTextObject(text, lang) {
  if (typeof text === 'string') {
    return { value: text, lang }
  }

  return {
    value: text.value,
    lang: text.lang
  }
}

function toPersonObject(person) {
  if (typeof person === 'string') {
    return {
      value: person,
      url: [],
      image: []
    }
  }

  return {
    value: person.value,
    url: toArray(person.url).map(toUrlObject),
    image: toArray(person.image).map(toImageObject)
  }
}

function toSubtitlesObject(subtitles) {
  return { type: subtitles.type || '', language: toArray(subtitles.language).map(toTextObject) }
}

function toImageObject(image) {
  if (typeof image === 'string') return { type: '', size: '', orient: '', system: '', value: image }

  return {
    type: image.type || '',
    size: image.size || '',
    orient: image.orient || '',
    system: image.system || '',
    value: image.value
  }
}

function toRatingObject(rating) {
  if (typeof rating === 'string') return { system: '', icon: [], value: rating }

  return {
    system: rating.system || '',
    icon: toArray(rating.icon).map(toIconObject),
    value: rating.value || ''
  }
}

function toLengthObject(length) {
  if (typeof length === 'string') return { units: '', value: length }

  return {
    units: length.units || '',
    value: length.value || ''
  }
}

function toUrlObject(url) {
  if (typeof url === 'string') return { system: '', value: url }

  return {
    system: url.system || '',
    value: url.value || ''
  }
}

function toVideoObject(video) {
  if (!video) return {}

  return {
    present: video.present || '',
    colour: video.colour || '',
    aspect: video.aspect || '',
    quality: video.quality || ''
  }
}

function toAudioObject(audio) {
  if (!audio) return {}

  return {
    present: audio.present || '',
    stereo: audio.stereo || ''
  }
}

function toReviewObject(review) {
  if (!review) return {}

  return {
    type: review.type || '',
    source: review.source || '',
    reviewer: review.reviewer || '',
    lang: review.lang || '',
    value: review.value || ''
  }
}

function toPreviouslyShownObject(previouslyShown) {
  if (!previouslyShown) return {}

  return {
    start: previouslyShown.start || '',
    channel: previouslyShown.channel || ''
  }
}

function toIconObject(icon) {
  if (!icon) return { src: '' }
  if (typeof icon === 'string') return { src: icon }

  return {
    src: icon.src,
    width: icon.width,
    height: icon.height
  }
}

function makeEpisodeNumberObjects(s, e) {
  s = parseNumber(s)
  e = parseNumber(e)

  return [createXMLTVNS(s, e), createOnScreen(s, e)].filter(Boolean)
}

function toEpisodeNumberObject(episode) {
  if (!episode) return {}

  return {
    system: episode.system || '',
    value: episode.value || ''
  }
}

function createXMLTVNS(s, e) {
  if (!e) return null
  s = s || 1

  return {
    system: 'xmltv_ns',
    value: `${s - 1}.${e - 1}.0/1`
  }
}

function createOnScreen(s, e) {
  if (!e) return null
  s = s || 1

  s = padStart(s, 2, '0')
  e = padStart(e, 2, '0')

  return {
    system: 'onscreen',
    value: `S${s}E${e}`
  }
}
