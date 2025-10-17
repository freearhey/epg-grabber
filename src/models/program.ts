import { escapeString, formatDate, createXMLElement, toArray } from '../utils'
import { SiteConfigParser } from '../types/siteConfig'
import utc from 'dayjs/plugin/utc.js'
import dayjs, { Dayjs } from 'dayjs'
import { Channel } from './channel'
import _ from 'lodash'

dayjs.extend(utc)

export class Program {
  site: string
  start: number
  stop: number
  channel: string
  titles: Program.TextObject[]
  subTitles: Program.TextObject[]
  descriptions: Program.TextObject[]
  date: number | null
  categories: Program.TextObject[]
  keywords: Program.TextObject[]
  languages: Program.TextObject[]
  origLanguages: Program.TextObject[]
  length: Program.LenghtObject[]
  urls: Program.UrlObject[]
  countries: Program.TextObject[]
  episodeNumbers: Program.EpisodeNumberObject[]
  video: Program.VideoObject | null
  audio: Program.AudioObject | null
  previouslyShown: Program.PreviouslyShownObject[]
  premiere: Program.TextObject[]
  lastChance: Program.TextObject[]
  new: boolean
  subtitles: Program.SubtitlesObject[]
  ratings: Program.RatingObject[]
  starRatings: Program.RatingObject[]
  reviews: Program.ReviewObject[]
  directors: Program.PersonObject[]
  actors: Program.PersonObject[]
  writers: Program.PersonObject[]
  adapters: Program.PersonObject[]
  producers: Program.PersonObject[]
  composers: Program.PersonObject[]
  editors: Program.PersonObject[]
  presenters: Program.PersonObject[]
  commentators: Program.PersonObject[]
  guests: Program.PersonObject[]
  images: Program.ImageObject[]
  icons: Program.IconObject[]

  constructor(data: Program.Data) {
    this.site = data.site
    this.start = data.start
    this.stop = data.stop
    this.channel = data.channel
    this.titles = data.titles || []
    this.subTitles = data.subTitles || []
    this.descriptions = data.descriptions || []
    this.date = data.date || null
    this.categories = data.categories || []
    this.keywords = data.keywords || []
    this.languages = data.languages || []
    this.origLanguages = data.origLanguages || []
    this.length = data.length || []
    this.urls = data.urls || []
    this.countries = data.countries || []
    this.episodeNumbers = data.episodeNumbers || []
    this.video = data.video || null
    this.audio = data.audio || null
    this.previouslyShown = data.previouslyShown || []
    this.premiere = data.premiere || []
    this.lastChance = data.lastChance || []
    this.new = data.new === true ? true : false
    this.subtitles = data.subtitles || []
    this.ratings = data.ratings || []
    this.starRatings = data.starRatings || []
    this.reviews = data.reviews || []
    this.directors = data.directors || []
    this.actors = data.actors || []
    this.writers = data.writers || []
    this.adapters = data.adapters || []
    this.producers = data.producers || []
    this.composers = data.composers || []
    this.editors = data.editors || []
    this.presenters = data.presenters || []
    this.commentators = data.commentators || []
    this.guests = data.guests || []
    this.images = data.images || []
    this.icons = data.icons || []
  }

  static fromParserData(data: SiteConfigParser.Data, channel: Channel): Program {
    if (!(channel instanceof Channel)) {
      throw new Error('The second argument in the constructor must be the "Channel" class')
    }

    function toTextObject(
      text: Program.TextObject | string | null,
      lang?: string
    ): Program.TextObject {
      text = text || ''

      if (typeof text === 'string') {
        return { value: text, lang }
      }

      return {
        value: text.value,
        lang: text.lang
      }
    }

    function toPersonObject(person: Program.PersonObject | string): Program.PersonObject {
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

    function toSubtitlesObject(subtitles: Program.SubtitlesObject) {
      return {
        type: subtitles.type || '',
        language: toArray(subtitles.language).map(text => toTextObject(text))
      }
    }

    function toImageObject(image: Program.ImageObject | string): Program.ImageObject {
      if (typeof image === 'string')
        return { type: '', size: '', orient: '', system: '', value: image }

      return {
        type: image.type || '',
        size: image.size || '',
        orient: image.orient || '',
        system: image.system || '',
        value: image.value
      }
    }

    function toRatingObject(rating: Program.RatingObject | string): Program.RatingObject {
      if (typeof rating === 'string') return { system: '', icon: [], value: rating }

      return {
        system: rating.system || '',
        icon: toArray(rating.icon).map(toIconObject),
        value: rating.value || ''
      }
    }

    function toLengthObject(length: Program.LenghtObject | string): Program.LenghtObject {
      if (typeof length === 'string') return { units: '', value: length }

      return {
        units: length.units || '',
        value: length.value || ''
      }
    }

    function toUrlObject(url: Program.UrlObject | string): Program.UrlObject {
      if (typeof url === 'string') return { system: '', value: url }

      return {
        system: url.system || '',
        value: url.value || ''
      }
    }

    function toVideoObject(video?: Program.VideoObject | null): Program.VideoObject {
      if (!video) return {}

      return {
        present: video.present || '',
        colour: video.colour || '',
        aspect: video.aspect || '',
        quality: video.quality || ''
      }
    }

    function toAudioObject(audio?: Program.AudioObject | null): Program.AudioObject {
      if (!audio) return {}

      return {
        present: audio.present || '',
        stereo: audio.stereo || ''
      }
    }

    function toReviewObject(review?: Program.ReviewObject | null): Program.ReviewObject {
      if (!review) return {}

      return {
        type: review.type || '',
        source: review.source || '',
        reviewer: review.reviewer || '',
        lang: review.lang || '',
        value: review.value || ''
      }
    }

    function toPreviouslyShownObject(
      previouslyShown?: Program.PreviouslyShownObject
    ): Program.PreviouslyShownObject {
      if (!previouslyShown) return {}

      return {
        start: previouslyShown.start || '',
        channel: previouslyShown.channel || ''
      }
    }

    function toIconObject(icon?: Program.IconObject | string): Program.IconObject {
      if (!icon) return { src: '' }
      if (typeof icon === 'string') return { src: icon }

      return {
        src: icon.src,
        width: icon.width,
        height: icon.height
      }
    }

    function toUnix(date: string | number | Date | Dayjs): number {
      return dayjs.utc(date).valueOf()
    }

    function makeEpisodeNumberObjects(
      seasonNumberAny?: string | number | null,
      episodeNumberAny?: string | number | null
    ): Program.EpisodeNumberObject[] {
      if (!seasonNumberAny) seasonNumberAny = 1
      if (!episodeNumberAny) return []

      const seasonNumber =
        typeof seasonNumberAny === 'number' ? seasonNumberAny : parseInt(seasonNumberAny)
      const episodeNumber =
        typeof episodeNumberAny === 'number' ? episodeNumberAny : parseInt(episodeNumberAny)

      return [
        createXMLTVNS(seasonNumber, episodeNumber),
        createOnScreen(seasonNumber, episodeNumber)
      ].filter((value: Program.EpisodeNumberObject | null) => value !== null)
    }

    function toEpisodeNumberObject(
      episode?: Program.EpisodeNumberObject
    ): Program.EpisodeNumberObject {
      if (!episode) return {}

      return {
        system: episode.system || '',
        value: episode.value || ''
      }
    }

    function createXMLTVNS(
      seasonNumber: number,
      episodeNumber: number
    ): Program.EpisodeNumberObject | null {
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
    ): Program.EpisodeNumberObject | null {
      if (!episodeNumber) return null
      seasonNumber = seasonNumber || 1

      const seasonNumberString = _.padStart(seasonNumber.toString(), 2, '0')
      const episodeNumberString = _.padStart(episodeNumber.toString(), 2, '0')

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
      titles: toArray(data.titles || data.title).map(text => toTextObject(text, lang)),
      subTitles: toArray(data.subTitles || data.subTitle || data.sub_titles || data.sub_title).map(
        text => toTextObject(text, lang)
      ),
      descriptions: toArray(data.descriptions || data.description || data.desc).map(text =>
        toTextObject(text, lang)
      ),
      date: data.date ? toUnix(data.date) : 0,
      categories: toArray(data.categories || data.category).map(text => toTextObject(text, lang)),
      keywords: toArray(data.keywords || data.keyword).map(text => toTextObject(text, lang)),
      languages: toArray(data.languages || data.language).map(text => toTextObject(text, lang)),
      origLanguages: toArray(data.origLanguages || data.origLanguage).map(text =>
        toTextObject(text, lang)
      ),
      length: toArray(data.length).map(toLengthObject),
      urls: toArray(data.urls || data.url).map(toUrlObject),
      countries: toArray(data.countries || data.country).map(text => toTextObject(text, lang)),
      episodeNumbers: toArray(
        data.episodeNum ||
          data.episodeNumber ||
          data.episodeNumbers ||
          makeEpisodeNumberObjects(data.season, data.episode)
      ).map(toEpisodeNumberObject),
      video: toVideoObject(data.video),
      audio: toAudioObject(data.audio),
      previouslyShown: toArray(data.previouslyShown).map(toPreviouslyShownObject),
      premiere: toArray(data.premiere).map(text => toTextObject(text, lang)),
      lastChance: toArray(data.lastChance).map(text => toTextObject(text, lang)),
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

    function createCastMember(position: string, person: Program.PersonObject) {
      return el(position, {}, [
        escapeString(person.value),
        ...toArray(person.url).map(createURLElement),
        ...toArray(person.image).map(createImageElement)
      ])
    }

    function createImageElement(image: Program.ImageObject) {
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

    function createURLElement(url: Program.UrlObject) {
      return el('url', { system: url.system }, [escapeString(url.value)])
    }

    return el(
      'programme',
      {
        start: formatDate(this.start, 'YYYYMMDDHHmmss ZZ'),
        stop: formatDate(this.stop, 'YYYYMMDDHHmmss ZZ'),
        channel: this.channel
      },
      [
        ...this.titles.map(title => el('title', { lang: title.lang }, [escapeString(title.value)])),
        ...this.subTitles.map(subTitle =>
          el('sub-title', { lang: subTitle.lang }, [escapeString(subTitle.value)])
        ),
        ...this.descriptions.map(desc =>
          el('desc', { lang: desc.lang }, [escapeString(desc.value)])
        ),
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
          el('episode-num', { system: episode.system }, [episode.value])
        ),
        this.video
          ? el('video', {}, [
              el('present', {}, [this.video.present]),
              el('colour', {}, [this.video.colour]),
              el('aspect', {}, [this.video.aspect]),
              el('quality', {}, [this.video.quality])
            ])
          : null,
        this.audio
          ? el('audio', {}, [
              el('present', {}, [this.audio.present]),
              el('stereo', {}, [this.audio.stereo])
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
            ...toArray(rating.icon).map(icon => el('icon', icon))
          ])
        ),
        ...this.starRatings.map(rating =>
          el('star-rating', { system: rating.system }, [
            el('value', {}, [escapeString(rating.value)]),
            ...toArray(rating.icon).map(icon => el('icon', icon))
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
        ...this.icons.map(icon => el('icon', icon))
      ]
    )
  }

  toObject(): Program.Data {
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
