import { Dayjs } from 'dayjs'

declare namespace ProgramData {
  export interface TextObject {
    value: string
    lang: string
  }

  export interface UrlObject {
    system: string
    value: string
  }

  export interface ImageObject {
    type: string
    size: string
    orient: string
    system: string
    value: string
  }

  export interface PersonObject {
    value: string
    urls: ProgramData.UrlObject[]
    images: ProgramData.ImageObject[]
  }

  export interface LenghtObject {
    units: string
    value: string
  }

  export interface EpisodeNumberObject {
    system: string
    value: string
  }

  export interface VideoObject {
    present: string
    colour: string
    aspect: string
    quality: string
  }

  export interface AudioObject {
    present: string
    stereo: string
  }

  export interface PreviouslyShownObject {
    start: string
    channel: string
  }

  export interface SubtitlesObject {
    type: string
    language: ProgramData.TextObject[]
  }

  export interface IconObject {
    src: string
    width: string
    height: string
  }

  export interface RatingObject {
    system: string
    icons: ProgramData.IconObject[]
    value: string
  }

  export interface ReviewObject {
    type: string
    source: string
    reviewer: string
    lang: string
    value: string
  }
}

export interface ProgramData {
  site: string
  start: number
  stop: number
  channel: string
  titles: ProgramData.TextObject[]
  subTitles?: ProgramData.TextObject[]
  descriptions?: ProgramData.TextObject[]
  date?: number | null
  categories?: ProgramData.TextObject[]
  keywords?: ProgramData.TextObject[]
  languages?: ProgramData.TextObject[]
  origLanguages?: ProgramData.TextObject[]
  length?: ProgramData.LenghtObject[]
  urls?: ProgramData.UrlObject[]
  countries?: ProgramData.TextObject[]
  episodeNumbers?: ProgramData.EpisodeNumberObject[]
  video?: ProgramData.VideoObject | null
  audio?: ProgramData.AudioObject | null
  previouslyShown?: ProgramData.PreviouslyShownObject[]
  premiere?: ProgramData.TextObject[]
  lastChance?: ProgramData.TextObject[]
  new?: boolean
  subtitles?: ProgramData.SubtitlesObject[]
  ratings?: ProgramData.RatingObject[]
  starRatings?: ProgramData.RatingObject[]
  reviews?: ProgramData.ReviewObject[]
  directors?: ProgramData.PersonObject[]
  actors?: ProgramData.PersonObject[]
  writers?: ProgramData.PersonObject[]
  adapters?: ProgramData.PersonObject[]
  producers?: ProgramData.PersonObject[]
  composers?: ProgramData.PersonObject[]
  editors?: ProgramData.PersonObject[]
  presenters?: ProgramData.PersonObject[]
  commentators?: ProgramData.PersonObject[]
  guests?: ProgramData.PersonObject[]
  images?: ProgramData.ImageObject[]
  icons?: ProgramData.IconObject[]
}

declare namespace ProgramParserResult {
  type TextObject = ProgramData.TextObject | Partial<ProgramData.TextObject>
  type PersonObject = {
    value: string
    url?:
      | string
      | string[]
      | ProgramData.UrlObject
      | ProgramData.UrlObject[]
      | ProgramParserResult.UrlObject
      | ProgramParserResult.UrlObject[]
    urls?:
      | string
      | string[]
      | ProgramData.UrlObject
      | ProgramData.UrlObject[]
      | ProgramParserResult.UrlObject
      | ProgramParserResult.UrlObject[]
    image?:
      | string
      | string[]
      | ProgramData.ImageObject
      | ProgramData.ImageObject[]
      | ProgramParserResult.ImageObject
      | ProgramParserResult.ImageObject[]
    images?:
      | string
      | string[]
      | ProgramData.ImageObject
      | ProgramData.ImageObject[]
      | ProgramParserResult.ImageObject
      | ProgramParserResult.ImageObject[]
  }
  type ImageObject = ProgramData.ImageObject | Partial<ProgramData.ImageObject>
  type IconObject =
    | ProgramData.IconObject
    | Partial<ProgramData.IconObject>
    | { src: string; width?: number | string | null; height?: number | string | null }
  type EpisodeNumberObject =
    | ProgramData.EpisodeNumberObject
    | Partial<ProgramData.EpisodeNumberObject>
  type UrlObject = ProgramData.UrlObject | Partial<ProgramData.UrlObject>
  type LenghtObject = ProgramData.LenghtObject | Partial<ProgramData.LenghtObject>
  type RatingObject = {
    system?: string
    value: string
    icon?: string | IconObject
    icons?: string | IconObject
  }
  type ReviewObject = ProgramData.ReviewObject | Partial<ProgramData.ReviewObject>
  type VideoObject = ProgramData.VideoObject | Partial<ProgramData.VideoObject>
  type AudioObject = ProgramData.AudioObject | Partial<ProgramData.AudioObject>
  type PreviouslyShownObject =
    | ProgramData.PreviouslyShownObject
    | Partial<ProgramData.PreviouslyShownObject>
  type SubtitlesObject = ProgramData.SubtitlesObject | Partial<ProgramData.SubtitlesObject>
}

export interface ProgramParserResult {
  start?: string | number | Date | Dayjs | null
  stop?: string | number | Date | Dayjs | null
  channel?: string | null
  title?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  titles?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  subTitles?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  subTitle?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  sub_titles?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  sub_title?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  descriptions?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  description?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  desc?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  date?: string | number | Date | Dayjs | null
  categories?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  category?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  keywords?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  keyword?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  languages?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  language?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  origLanguages?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  origLanguage?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  length?:
    | string
    | string[]
    | ProgramParserResult.LenghtObject
    | ProgramParserResult.LenghtObject[]
    | null
  urls?: string | string[] | ProgramParserResult.UrlObject | ProgramParserResult.UrlObject[] | null
  url?: string | string[] | ProgramParserResult.UrlObject | ProgramParserResult.UrlObject[] | null
  countries?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  country?:
    | string
    | string[]
    | ProgramParserResult.TextObject
    | ProgramParserResult.TextObject[]
    | null
  site?: string | null
  episodeNumbers?:
    | ProgramParserResult.EpisodeNumberObject
    | ProgramParserResult.EpisodeNumberObject[]
    | null
  episodeNumber?:
    | ProgramParserResult.EpisodeNumberObject
    | ProgramParserResult.EpisodeNumberObject[]
    | null
  episodeNum?:
    | ProgramParserResult.EpisodeNumberObject
    | ProgramParserResult.EpisodeNumberObject[]
    | null
  season?: string | number | null
  episode?: string | number | null
  video?: ProgramParserResult.VideoObject | null
  audio?: ProgramParserResult.AudioObject | null
  previouslyShown?:
    | ProgramParserResult.PreviouslyShownObject
    | ProgramParserResult.PreviouslyShownObject[]
    | null
  premiere?: ProgramParserResult.TextObject | null
  lastChance?: ProgramParserResult.TextObject | null
  new?: boolean
  subtitles?: ProgramParserResult.SubtitlesObject | ProgramParserResult.SubtitlesObject[] | null
  ratings?:
    | string
    | string[]
    | ProgramParserResult.RatingObject
    | ProgramParserResult.RatingObject[]
    | null
  rating?:
    | string
    | string[]
    | ProgramParserResult.RatingObject
    | ProgramParserResult.RatingObject[]
    | null
  starRatings?:
    | string
    | string[]
    | ProgramParserResult.RatingObject
    | ProgramParserResult.RatingObject[]
    | null
  starRating?:
    | string
    | string[]
    | ProgramParserResult.RatingObject
    | ProgramParserResult.RatingObject[]
    | null
  reviews?: ProgramParserResult.ReviewObject | ProgramParserResult.ReviewObject[] | null
  review?: ProgramParserResult.ReviewObject | ProgramParserResult.ReviewObject[] | null
  directors?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  director?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  actors?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  actor?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  writers?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  writer?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  adapters?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  adapter?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  producers?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  producer?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  composers?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  composer?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  editors?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  editor?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  presenters?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  presenter?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  commentators?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  commentator?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  guests?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  guest?:
    | string
    | string[]
    | ProgramParserResult.PersonObject
    | ProgramParserResult.PersonObject[]
    | null
  images?:
    | string
    | string[]
    | ProgramParserResult.ImageObject
    | ProgramParserResult.ImageObject[]
    | null
  image?:
    | string
    | string[]
    | ProgramParserResult.ImageObject
    | ProgramParserResult.ImageObject[]
    | null
  icons?:
    | string
    | string[]
    | ProgramParserResult.IconObject
    | ProgramParserResult.IconObject[]
    | null
  icon?:
    | string
    | string[]
    | ProgramParserResult.IconObject
    | ProgramParserResult.IconObject[]
    | null
}
