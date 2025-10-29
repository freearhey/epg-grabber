import { escapeString, formatDate, createXMLElement, toArray, toUnix } from '../core/utils'
import { ProgramData, ProgramParserResult, XMLElement } from '../types'
import padStart from 'lodash.padstart'
import utc from 'dayjs/plugin/utc.js'
import { Channel } from './channel'
import dayjs from 'dayjs'

dayjs.extend(utc)

export class Program {
  site: string
  start: number
  stop: number
  channel: string
  titles: ProgramData.TextObject[]
  subTitles: ProgramData.TextObject[]
  descriptions: ProgramData.TextObject[]
  date: number | null
  categories: ProgramData.TextObject[]
  keywords: ProgramData.TextObject[]
  languages: ProgramData.TextObject[]
  origLanguages: ProgramData.TextObject[]
  length: ProgramData.LenghtObject[]
  urls: ProgramData.UrlObject[]
  countries: ProgramData.TextObject[]
  episodeNumbers: ProgramData.EpisodeNumberObject[]
  video: ProgramData.VideoObject | null
  audio: ProgramData.AudioObject | null
  previouslyShown: ProgramData.PreviouslyShownObject[]
  premiere: ProgramData.TextObject[]
  lastChance: ProgramData.TextObject[]
  new: boolean
  subtitles: ProgramData.SubtitlesObject[]
  ratings: ProgramData.RatingObject[]
  starRatings: ProgramData.RatingObject[]
  reviews: ProgramData.ReviewObject[]
  directors: ProgramData.PersonObject[]
  actors: ProgramData.PersonObject[]
  writers: ProgramData.PersonObject[]
  adapters: ProgramData.PersonObject[]
  producers: ProgramData.PersonObject[]
  composers: ProgramData.PersonObject[]
  editors: ProgramData.PersonObject[]
  presenters: ProgramData.PersonObject[]
  commentators: ProgramData.PersonObject[]
  guests: ProgramData.PersonObject[]
  images: ProgramData.ImageObject[]
  icons: ProgramData.IconObject[]

  constructor(data: ProgramData) {
    if (typeof data.site !== 'string')
      throw new Error('The "site" property must be of type "string"')
    if (typeof data.start !== 'number')
      throw new Error('The "start" property must be of type "number"')
    if (typeof data.stop !== 'number')
      throw new Error('The "stop" property must be of type "number"')
    if (typeof data.channel !== 'string')
      throw new Error('The "channel" property must be of type "string"')
    if (!Array.isArray(data.titles)) throw new Error('The "start" property must be of type "array"')

    this.site = data.site
    this.channel = data.channel
    this.start = data.start
    this.stop = data.stop
    this.titles = data.titles
    this.subTitles = Array.isArray(data.subTitles) ? data.subTitles : []
    this.descriptions = Array.isArray(data.descriptions) ? data.descriptions : []
    this.date = typeof data.date === 'number' ? data.date : null
    this.categories = Array.isArray(data.categories) ? data.categories : []
    this.keywords = Array.isArray(data.keywords) ? data.keywords : []
    this.languages = Array.isArray(data.languages) ? data.languages : []
    this.origLanguages = Array.isArray(data.origLanguages) ? data.origLanguages : []
    this.length = Array.isArray(data.length) ? data.length : []
    this.urls = Array.isArray(data.urls) ? data.urls : []
    this.countries = Array.isArray(data.countries) ? data.countries : []
    this.episodeNumbers = Array.isArray(data.episodeNumbers) ? data.episodeNumbers : []
    this.video = typeof data.video === 'object' ? data.video : null
    this.audio = typeof data.audio === 'object' ? data.audio : null
    this.previouslyShown = Array.isArray(data.previouslyShown) ? data.previouslyShown : []
    this.premiere = Array.isArray(data.premiere) ? data.premiere : []
    this.lastChance = Array.isArray(data.lastChance) ? data.lastChance : []
    this.new = typeof data.new === 'boolean' ? data.new : false
    this.subtitles = Array.isArray(data.subtitles) ? data.subtitles : []
    this.ratings = Array.isArray(data.ratings) ? data.ratings : []
    this.starRatings = Array.isArray(data.starRatings) ? data.starRatings : []
    this.reviews = Array.isArray(data.reviews) ? data.reviews : []
    this.directors = Array.isArray(data.directors) ? data.directors : []
    this.actors = Array.isArray(data.actors) ? data.actors : []
    this.writers = Array.isArray(data.writers) ? data.writers : []
    this.adapters = Array.isArray(data.adapters) ? data.adapters : []
    this.producers = Array.isArray(data.producers) ? data.producers : []
    this.composers = Array.isArray(data.composers) ? data.composers : []
    this.editors = Array.isArray(data.editors) ? data.editors : []
    this.presenters = Array.isArray(data.presenters) ? data.presenters : []
    this.commentators = Array.isArray(data.commentators) ? data.commentators : []
    this.guests = Array.isArray(data.guests) ? data.guests : []
    this.images = Array.isArray(data.images) ? data.images : []
    this.icons = Array.isArray(data.icons) ? data.icons : []
  }

  static fromParserResult(data: ProgramParserResult, channel: Channel): Program {
    function toTextObject(
      value: ProgramParserResult.TextObject | string | null,
      lang: string = ''
    ): ProgramData.TextObject {
      if (!value) return { value: '', lang }
      if (typeof value === 'string') return { value, lang }

      return {
        value: typeof value.value === 'string' ? value.value : '',
        lang: typeof value.lang === 'string' ? value.lang : ''
      }
    }

    function toPersonObject(
      value: ProgramParserResult.PersonObject | string | null
    ): ProgramData.PersonObject {
      if (!value) return { value: '', urls: [], images: [] }
      if (typeof value === 'string') return { value, urls: [], images: [] }

      return {
        value: value.value,
        urls: toArray(value.urls || value.url).map(toUrlObject),
        images: toArray(value.images || value.image).map(toImageObject)
      }
    }

    function toSubtitlesObject(
      value: ProgramParserResult.SubtitlesObject | null
    ): ProgramData.SubtitlesObject {
      if (!value) return { type: '', language: [] }

      return {
        type: typeof value.type === 'string' ? value.type : '',
        language: toArray(value.language).map(text => toTextObject(text))
      }
    }

    function toImageObject(
      value: ProgramParserResult.ImageObject | string | null
    ): ProgramData.ImageObject {
      if (!value) return { type: '', size: '', orient: '', system: '', value: '' }
      if (typeof value === 'string') return { type: '', size: '', orient: '', system: '', value }

      return {
        type: typeof value.type === 'string' ? value.type : '',
        size: typeof value.size === 'string' ? value.size : '',
        orient: typeof value.orient === 'string' ? value.orient : '',
        system: typeof value.system === 'string' ? value.system : '',
        value: typeof value.value === 'string' ? value.value : ''
      }
    }

    function toRatingObject(
      value: ProgramParserResult.RatingObject | string | null
    ): ProgramData.RatingObject {
      if (!value) return { system: '', icons: [], value: '' }
      if (typeof value === 'string') return { system: '', icons: [], value }

      return {
        system: typeof value.system === 'string' ? value.system : '',
        icons: toArray(value.icons || value.icon).map(toIconObject),
        value: typeof value.value === 'string' ? value.value : ''
      }
    }

    function toLengthObject(
      value: ProgramParserResult.LenghtObject | string | number | null
    ): ProgramData.LenghtObject {
      if (!value) return { units: '', value: '' }
      if (typeof value === 'string') return { units: '', value }
      if (typeof value === 'number') return { units: '', value: value.toString() }

      return {
        units: typeof value.units === 'string' ? value.units : '',
        value: typeof value.value === 'string' ? value.value : ''
      }
    }

    function toUrlObject(
      value: ProgramParserResult.UrlObject | string | null
    ): ProgramData.UrlObject {
      if (!value) return { system: '', value: '' }
      if (typeof value === 'string') return { system: '', value }

      return {
        system: typeof value.system === 'string' ? value.system : '',
        value: typeof value.value === 'string' ? value.value : ''
      }
    }

    function toVideoObject(
      value?: ProgramParserResult.VideoObject | null
    ): ProgramData.VideoObject {
      if (!value) return { present: '', colour: '', aspect: '', quality: '' }

      return {
        present: typeof value.present === 'string' ? value.present : '',
        colour: typeof value.colour === 'string' ? value.colour : '',
        aspect: typeof value.aspect === 'string' ? value.aspect : '',
        quality: typeof value.quality === 'string' ? value.quality : ''
      }
    }

    function toAudioObject(
      value?: ProgramParserResult.AudioObject | null
    ): ProgramData.AudioObject {
      if (!value) return { present: '', stereo: '' }

      return {
        present: typeof value.present === 'string' ? value.present : '',
        stereo: typeof value.stereo === 'string' ? value.stereo : ''
      }
    }

    function toReviewObject(
      value?: ProgramParserResult.ReviewObject | null
    ): ProgramData.ReviewObject {
      if (!value) return { type: '', source: '', reviewer: '', lang: '', value: '' }

      return {
        type: typeof value.type === 'string' ? value.type : '',
        source: typeof value.source === 'string' ? value.source : '',
        reviewer: typeof value.reviewer === 'string' ? value.reviewer : '',
        lang: typeof value.lang === 'string' ? value.lang : '',
        value: typeof value.value === 'string' ? value.value : ''
      }
    }

    function toPreviouslyShownObject(
      value?: ProgramParserResult.PreviouslyShownObject | null
    ): ProgramData.PreviouslyShownObject {
      if (!value) return { start: '', channel: '' }

      return {
        start: typeof value.start === 'string' ? value.start : '',
        channel: typeof value.channel === 'string' ? value.channel : ''
      }
    }

    function toIconObject(
      value?: ProgramParserResult.IconObject | string | null
    ): ProgramData.IconObject {
      if (!value) return { src: '', width: '', height: '' }
      if (typeof value === 'string') return { src: value, width: '', height: '' }

      return {
        src: typeof value.src === 'string' ? value.src : '',
        width:
          typeof value.width === 'string'
            ? value.width
            : typeof value.width === 'number'
            ? value.width.toString()
            : '',
        height:
          typeof value.height === 'string'
            ? value.height
            : typeof value.height === 'number'
            ? value.height.toString()
            : ''
      }
    }

    function makeEpisodeNumberObjects(
      seasonNumberAny?: string | number | null,
      episodeNumberAny?: string | number | null
    ): ProgramData.EpisodeNumberObject[] {
      if (!seasonNumberAny) seasonNumberAny = 1
      if (!episodeNumberAny) return []

      const seasonNumber =
        typeof seasonNumberAny === 'number' ? seasonNumberAny : parseInt(seasonNumberAny)
      const episodeNumber =
        typeof episodeNumberAny === 'number' ? episodeNumberAny : parseInt(episodeNumberAny)

      return [
        createXMLTVNS(seasonNumber, episodeNumber),
        createOnScreen(seasonNumber, episodeNumber)
      ].filter((value: ProgramData.EpisodeNumberObject | null) => value !== null)
    }

    function toEpisodeNumberObject(
      value?: ProgramParserResult.EpisodeNumberObject | null
    ): ProgramData.EpisodeNumberObject {
      if (!value) return { system: '', value: '' }

      return {
        system: typeof value.system === 'string' ? value.system : '',
        value: typeof value.value === 'string' ? value.value : ''
      }
    }

    function createXMLTVNS(
      seasonNumber: number,
      episodeNumber: number
    ): ProgramData.EpisodeNumberObject | null {
      if (!episodeNumber) return null
      seasonNumber = seasonNumber || 1

      return {
        system: 'xmltv_ns',
        value: `${seasonNumber - 1}.${episodeNumber - 1}.0/1`
      }
    }

    function createOnScreen(
      seasonNumber: number,
      episodeNumber: number
    ): ProgramData.EpisodeNumberObject | null {
      if (!episodeNumber) return null
      seasonNumber = seasonNumber || 1

      const seasonNumberString = padStart(seasonNumber.toString(), 2, '0')
      const episodeNumberString = padStart(episodeNumber.toString(), 2, '0')

      return {
        system: 'onscreen',
        value: `S${seasonNumberString}E${episodeNumberString}`
      }
    }

    const lang = channel.lang || undefined

    const program = new Program({
      site: channel.site,
      start: data.start ? toUnix(data.start) : 0,
      stop: data.stop ? toUnix(data.stop) : 0,
      channel: channel.xmltv_id || '',
      titles: toArray(data.titles || data.title).map(value => toTextObject(value, lang)),
      subTitles: toArray(data.subTitles || data.subTitle || data.sub_titles || data.sub_title).map(
        value => toTextObject(value, lang)
      ),
      descriptions: toArray(data.descriptions || data.description || data.desc).map(value =>
        toTextObject(value, lang)
      ),
      date: data.date ? toUnix(data.date) : 0,
      categories: toArray(data.categories || data.category).map(value => toTextObject(value, lang)),
      keywords: toArray(data.keywords || data.keyword).map(value => toTextObject(value, lang)),
      languages: toArray(data.languages || data.language).map(value => toTextObject(value, lang)),
      origLanguages: toArray(data.origLanguages || data.origLanguage).map(value =>
        toTextObject(value, lang)
      ),
      length: toArray(data.length).map(toLengthObject),
      urls: toArray(data.urls || data.url).map(toUrlObject),
      countries: toArray(data.countries || data.country).map(value => toTextObject(value, lang)),
      episodeNumbers: toArray(
        data.episodeNum ||
          data.episodeNumber ||
          data.episodeNumbers ||
          makeEpisodeNumberObjects(data.season, data.episode)
      ).map(toEpisodeNumberObject),
      video: toVideoObject(data.video),
      audio: toAudioObject(data.audio),
      previouslyShown: toArray(data.previouslyShown).map(toPreviouslyShownObject),
      premiere: toArray(data.premiere).map(value => toTextObject(value, lang)),
      lastChance: toArray(data.lastChance).map(value => toTextObject(value, lang)),
      new: data.new || false,
      subtitles: toArray(data.subtitles).map(toSubtitlesObject),
      ratings: toArray(data.ratings || data.rating).map(toRatingObject),
      starRatings: toArray(data.starRatings || data.starRating).map(toRatingObject),
      reviews: toArray(data.reviews || data.review).map(toReviewObject),
      directors: toArray(data.directors || data.director).map(toPersonObject),
      actors: toArray(data.actors || data.actor).map(toPersonObject),
      writers: toArray(data.writers || data.writer).map(toPersonObject),
      adapters: toArray(data.adapters || data.adapter).map(toPersonObject),
      producers: toArray(data.producers || data.producer).map(toPersonObject),
      composers: toArray(data.composers || data.composer).map(toPersonObject),
      editors: toArray(data.editors || data.editor).map(toPersonObject),
      presenters: toArray(data.presenters || data.presenter).map(toPersonObject),
      commentators: toArray(data.commentators || data.commentator).map(toPersonObject),
      guests: toArray(data.guests || data.guest).map(toPersonObject),
      images: toArray(data.images || data.image).map(toImageObject),
      icons: toArray(data.icons || data.icon).map(toIconObject)
    })

    return program
  }

  toXML(): string {
    const el = createXMLElement

    function createCastMember(position: string, person: ProgramData.PersonObject) {
      return el(position, {}, [
        escapeString(person.value),
        ...person.urls.map(createURLElement),
        ...person.images.map(createImageElement)
      ])
    }

    function createImageElement(image: ProgramData.ImageObject) {
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

    function createURLElement(url: ProgramData.UrlObject) {
      return el('url', { system: url.system }, [escapeString(url.value)])
    }

    const children: (XMLElement | null)[] = [
      ...this.titles.map(title => el('title', { lang: title.lang }, [escapeString(title.value)])),
      ...this.subTitles.map(subTitle =>
        el('sub-title', { lang: subTitle.lang }, [escapeString(subTitle.value)])
      ),
      ...this.descriptions.map(desc => el('desc', { lang: desc.lang }, [escapeString(desc.value)])),
      el('credits', {}, [
        ...this.directors.map(data => createCastMember('director', data)),
        ...this.actors.map(data => createCastMember('actor', data)),
        ...this.writers.map(data => createCastMember('writer', data)),
        ...this.adapters.map(data => createCastMember('adapter', data)),
        ...this.producers.map(data => createCastMember('producer', data)),
        ...this.composers.map(data => createCastMember('composer', data)),
        ...this.editors.map(data => createCastMember('editor', data)),
        ...this.presenters.map(data => createCastMember('presenter', data)),
        ...this.commentators.map(data => createCastMember('commentator', data)),
        ...this.guests.map(data => createCastMember('guest', data))
      ]),
      el('date', {}, [formatDate(this.date, 'YYYYMMDD')]),
      ...this.categories.map(category =>
        el('category', { lang: category.lang }, [escapeString(category.value)])
      ),
      ...this.keywords.map(keyword =>
        el('keyword', { lang: keyword.lang }, [escapeString(keyword.value)])
      ),
      ...this.languages.map(language =>
        el('language', { lang: language.lang }, [escapeString(language.value)])
      ),
      ...this.origLanguages.map(origLanguage =>
        el('orig-language', { lang: origLanguage.lang }, [escapeString(origLanguage.value)])
      ),
      ...this.length.map(length =>
        el('length', { units: length.units }, [escapeString(length.value)])
      ),
      ...this.countries.map(country =>
        el('country', { lang: country.lang }, [escapeString(country.value)])
      ),
      ...this.urls.map(createURLElement),
      ...this.episodeNumbers.map(episode =>
        el('episode-num', { system: episode.system }, [escapeString(episode.value)])
      ),
      this.video
        ? el('video', {}, [
            el('present', {}, typeof this.video.present === 'string' ? [this.video.present] : []),
            el('colour', {}, typeof this.video.colour === 'string' ? [this.video.colour] : []),
            el('aspect', {}, typeof this.video.aspect === 'string' ? [this.video.aspect] : []),
            el('quality', {}, typeof this.video.quality === 'string' ? [this.video.quality] : [])
          ])
        : null,
      this.audio
        ? el('audio', {}, [
            el('present', {}, typeof this.audio.present === 'string' ? [this.audio.present] : []),
            el('stereo', {}, typeof this.audio.stereo === 'string' ? [this.audio.stereo] : [])
          ])
        : null,
      ...this.previouslyShown.map(previouslyShown =>
        el(
          'previously-shown',
          {
            start: previouslyShown.start,
            channel: previouslyShown.channel
          },
          []
        )
      ),
      ...this.premiere.map(premiere =>
        el('premiere', { lang: premiere.lang }, [escapeString(premiere.value)])
      ),
      ...this.lastChance.map(lastChance =>
        el('last-chance', { lang: lastChance.lang }, [escapeString(lastChance.value)])
      ),
      this.new ? el('new') : '',
      ...this.subtitles.map(subtitles =>
        el(
          'subtitles',
          { type: subtitles.type },
          subtitles.language.map(language =>
            el('language', { lang: language.lang }, [escapeString(language.value)])
          )
        )
      ),
      ...this.ratings.map(rating =>
        el('rating', { system: rating.system }, [
          el('value', {}, [escapeString(rating.value)]),
          ...rating.icons.map(icon =>
            el('icon', { src: icon.src, width: icon.width, height: icon.height })
          )
        ])
      ),
      ...this.starRatings.map(rating =>
        el('star-rating', { system: rating.system }, [
          el('value', {}, [escapeString(rating.value)]),
          ...rating.icons.map(icon =>
            el('icon', { src: icon.src, width: icon.width, height: icon.height })
          )
        ])
      ),
      ...this.reviews.map(review =>
        el(
          'review',
          {
            type: review.type,
            source: review.source,
            reviewer: review.reviewer,
            lang: review.lang
          },
          [escapeString(review.value || '')]
        )
      ),
      ...this.images.map(createImageElement),
      ...this.icons.map(icon =>
        el('icon', { src: icon.src, width: icon.width, height: icon.height })
      )
    ]

    return el(
      'programme',
      {
        start: formatDate(this.start, 'YYYYMMDDHHmmss ZZ'),
        stop: formatDate(this.stop, 'YYYYMMDDHHmmss ZZ'),
        channel: this.channel
      },
      children
    )
  }

  toObject(): ProgramData {
    return {
      site: this.site,
      start: this.start,
      stop: this.stop,
      channel: this.channel,
      titles: this.titles,
      subTitles: this.subTitles,
      descriptions: this.descriptions,
      date: this.date,
      categories: this.categories,
      keywords: this.keywords,
      languages: this.languages,
      origLanguages: this.origLanguages,
      length: this.length,
      urls: this.urls,
      countries: this.countries,
      episodeNumbers: this.episodeNumbers,
      video: this.video,
      audio: this.audio,
      previouslyShown: this.previouslyShown,
      premiere: this.premiere,
      lastChance: this.lastChance,
      new: this.new,
      subtitles: this.subtitles,
      ratings: this.ratings,
      starRatings: this.starRatings,
      reviews: this.reviews,
      directors: this.directors,
      actors: this.actors,
      writers: this.writers,
      adapters: this.adapters,
      producers: this.producers,
      composers: this.composers,
      editors: this.editors,
      presenters: this.presenters,
      commentators: this.commentators,
      guests: this.guests,
      images: this.images,
      icons: this.icons
    }
  }
}
