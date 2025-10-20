import { CacheRequestConfig } from 'axios-cache-interceptor'
import { AxiosResponseHeaders } from 'axios'
import { ProgramData } from './program'
import { Logger } from '../core/logger'
import { Channel } from '../models'
import { Dayjs } from 'dayjs'

export interface SiteConfigOptions {
  logger: Logger
}

export interface SiteConfigObject {
  site: string
  url: ((context: SiteConfigRequestContext) => string | Promise<string>) | string
  parser: (
    context: SiteConfigParserContext
  ) => SiteConfigParserResult[] | Promise<SiteConfigParserResult[]>
  filepath: string
  days?: number
  lang?: string
  delay?: number
  curl?: boolean
  gzip?: boolean
  maxConnections?: number
  debug?: boolean
  output?: string
  channels?: string | string[]
  request?: SiteConfigRequestConfig
  logo?: ((context: SiteConfigRequestContext) => string | Promise<string>) | string
}

export type SiteConfigRequestConfigData =
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | FormData
  | URLSearchParams
  | string
  | Record<string, unknown>
  | null

export type SiteConfigRequestConfig = Omit<CacheRequestConfig, 'headers' | 'data'> & {
  data?:
    | ((
        context: SiteConfigRequestContext
      ) => SiteConfigRequestConfigData | Promise<SiteConfigRequestConfigData>)
    | SiteConfigRequestConfigData
  headers?:
    | ((
        context: SiteConfigRequestContext
      ) => Record<string, string> | Promise<Record<string, string>>)
    | Record<string, string>
}

export interface SiteConfigRequestContext {
  channel: Channel
  date: Dayjs
}

export interface SiteConfigParserContext {
  content?: string
  buffer?: Buffer
  headers?: AxiosResponseHeaders | Partial<AxiosResponseHeaders>
  request?: CacheRequestConfig
  cached: boolean
  channel: Channel
  config: SiteConfigObject
  date: Dayjs
}

type DateObject = string | number | Date | Dayjs | null
type TextObject = string | ProgramData.TextObject
type PersonObject =
  | string
  | {
      value: string
      url?: string | string[] | ProgramData.UrlObject | ProgramData.UrlObject[]
      image?: string | string[] | ProgramData.ImageObject | ProgramData.ImageObject[]
    }
  | ProgramData.PersonObject
type ImageObject = string | ProgramData.ImageObject
type IconObject = string | ProgramData.IconObject
type EpisodeNumberObject = string | number | ProgramData.EpisodeNumberObject
type UrlObject = string | ProgramData.UrlObject
type LenghtObject = string | ProgramData.LenghtObject
type RatingObject =
  | string
  | { system?: string; value: string; icon: string | IconObject }
  | ProgramData.RatingObject
  | null
type ReviewObject = ProgramData.ReviewObject
type VideoObject = ProgramData.VideoObject
type AudioObject = ProgramData.AudioObject
type PreviouslyShownObject = ProgramData.PreviouslyShownObject
type SubtitlesObject = ProgramData.SubtitlesObject

export interface SiteConfigParserResult {
  start?: DateObject
  stop?: DateObject
  channel?: string | null
  title?: TextObject | TextObject[] | null
  titles?: TextObject | TextObject[] | null
  subTitles?: TextObject | TextObject[] | null
  subTitle?: TextObject | TextObject[] | null
  sub_titles?: TextObject | TextObject[] | null
  sub_title?: TextObject | TextObject[] | null
  descriptions?: TextObject | TextObject[] | null
  description?: TextObject | TextObject[] | null
  desc?: TextObject | TextObject[] | null
  date?: DateObject | null
  categories?: TextObject | TextObject[] | null
  category?: TextObject | TextObject[] | null
  keywords?: TextObject | TextObject[] | null
  keyword?: TextObject | TextObject[] | null
  languages?: TextObject | TextObject[] | null
  language?: TextObject | TextObject[] | null
  origLanguages?: TextObject | TextObject[] | null
  origLanguage?: TextObject | TextObject[] | null
  length?: LenghtObject | LenghtObject[] | null
  urls?: UrlObject | UrlObject[] | null
  url?: UrlObject | UrlObject[] | null
  countries?: TextObject | TextObject[] | null
  country?: TextObject | TextObject[] | null
  site?: string | null
  episodeNumbers?: EpisodeNumberObject | EpisodeNumberObject[] | null
  episodeNumber?: EpisodeNumberObject | EpisodeNumberObject[] | null
  episodeNum?: EpisodeNumberObject | EpisodeNumberObject[] | null
  season?: string | number | null
  episode?: string | number | null
  video?: VideoObject | null
  audio?: AudioObject | null
  previouslyShown?: PreviouslyShownObject | PreviouslyShownObject[] | null
  premiere?: TextObject | null
  lastChance?: TextObject | null
  new?: boolean
  subtitles?: SubtitlesObject | SubtitlesObject[] | null
  ratings?: RatingObject | RatingObject[] | null
  rating?: RatingObject | RatingObject[] | null
  starRatings?: RatingObject | RatingObject[] | null
  starRating?: RatingObject | RatingObject[] | null
  reviews?: ReviewObject | ReviewObject[] | null
  review?: ReviewObject | ReviewObject[] | null
  directors?: PersonObject | PersonObject[] | null
  director?: PersonObject | PersonObject[] | null
  actors?: PersonObject | PersonObject[] | null
  actor?: PersonObject | PersonObject[] | null
  writers?: PersonObject | PersonObject[] | null
  writer?: PersonObject | PersonObject[] | null
  adapters?: PersonObject | PersonObject[] | null
  adapter?: PersonObject | PersonObject[] | null
  producers?: PersonObject | PersonObject[] | null
  producer?: PersonObject | PersonObject[] | null
  composers?: PersonObject | PersonObject[] | null
  composer?: PersonObject | PersonObject[] | null
  editors?: PersonObject | PersonObject[] | null
  editor?: PersonObject | PersonObject[] | null
  presenters?: PersonObject | PersonObject[] | null
  presenter?: PersonObject | PersonObject[] | null
  commentators?: PersonObject | PersonObject[] | null
  commentator?: PersonObject | PersonObject[] | null
  guests?: PersonObject | PersonObject[] | null
  guest?: PersonObject | PersonObject[] | null
  images?: ImageObject | ImageObject[] | null
  image?: ImageObject | ImageObject[] | null
  icons?: IconObject | IconObject[] | null
  icon?: IconObject | IconObject[] | null
}
