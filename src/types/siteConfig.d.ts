import { CacheRequestConfig } from 'axios-cache-interceptor'
import { AxiosResponseHeaders } from 'axios'
import { Logger } from '../core/logger'
import { Channel } from '../models'
import { Dayjs } from 'dayjs'

export type SiteConfigOptions = {
  logger: Logger
}

export type SiteConfigProps = {
  site: string
  url: ((context: SiteConfigRequest.Context) => string | Promise<string>) | string
  parser: (
    context: SiteConfigParser.Context
  ) => SiteConfigParser.Data[] | Promise<SiteConfigParser.Data[]>
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
  request?: Omit<CacheRequestConfig, 'headers' | 'data'> & SiteConfigRequest.Config
  logo?: ((context: SiteConfigRequest.Context) => string | Promise<string>) | string
}

declare namespace SiteConfigRequest {
  type Data = ArrayBuffer | ArrayBufferView | Blob | FormData | URLSearchParams | string | null

  export type Config = {
    data?: ((context: SiteConfigRequest.Context) => Data | Promise<Data>) | Data | Promise<Data>
    headers?:
      | ((
          context: SiteConfigRequest.Context
        ) => Record<string, string> | Promise<Record<string, string>>)
      | Record<string, string>
      | Promise<Record<string, string>>
  }

  export type Context = {
    channel: Channel
    date: Dayjs
  }
}

declare namespace SiteConfigParser {
  export type Context = {
    content?: string
    buffer?: Buffer
    headers?: AxiosResponseHeaders | Partial<AxiosResponseHeaders>
    request?: CacheRequestConfig
    cached: boolean
    channel: Channel
    config: SiteConfigProps
    date: Dayjs
  }

  export type Data = {
    start?: DateObject
    stop?: DateObject
    channel?: string | null
    title?: TextObject
    titles?: TextObject
    subTitles?: TextObject
    subTitle?: TextObject
    sub_titles?: TextObject
    sub_title?: TextObject
    descriptions?: TextObject
    description?: TextObject
    desc?: TextObject
    date?: DateObject
    categories?: TextObject
    category?: TextObject
    keywords?: TextObject
    keyword?: TextObject
    languages?: TextObject
    language?: TextObject
    origLanguages?: TextObject
    origLanguage?: TextObject
    length?: string | Program.LenghtObject | null
    urls?: UrlObject
    url?: UrlObject
    countries?: TextObject
    country?: TextObject
    site?: string | null
    episodeNumbers?: EpisodeNumberObject
    episodeNumber?: EpisodeNumberObject
    episodeNum?: EpisodeNumberObject
    season?: string | number | null
    episode?: string | number | null
    video?: Program.VideoObject | null
    audio?: Program.AudioObject | null
    previouslyShown?: Program.PreviouslyShownObject | Program.PreviouslyShownObject[] | null
    premiere?: string | Program.TextObject | null
    lastChance?: string | Program.TextObject | null
    new?: boolean
    subtitles?: Program.SubtitlesObject | Program.SubtitlesObject[] | null
    ratings?: Program.RatingObject | Program.RatingObject[] | null
    rating?: Program.RatingObject | Program.RatingObject[] | null
    starRatings?: Program.RatingObject | Program.RatingObject[] | null
    starRating?: Program.RatingObject | Program.RatingObject[] | null
    reviews?: Program.ReviewObject | Program.ReviewObject[] | null
    review?: Program.ReviewObject | Program.ReviewObject[] | null
    directors?: PersonObject
    director?: PersonObject
    actors?: PersonObject
    actor?: PersonObject
    writers?: PersonObject
    writer?: PersonObject
    adapters?: PersonObject
    adapter?: PersonObject
    producers?: PersonObject
    producer?: PersonObject
    composers?: PersonObject
    composer?: PersonObject
    editors?: PersonObject
    editor?: PersonObject
    presenters?: PersonObject
    presenter?: PersonObject
    commentators?: PersonObject
    commentator?: PersonObject
    guests?: PersonObject
    guest?: PersonObject
    images?: ImageObject
    image?: ImageObject
    icons?: IconObject
    icon?: IconObject
  }

  export type DateObject = string | number | Date | Dayjs | null
  export type TextObject = string | string[] | Program.TextObject | Program.TextObject[] | null
  export type PersonObject =
    | string
    | string[]
    | Program.PersonObject
    | Program.PersonObject[]
    | null
  export type ImageObject = string | string[] | Program.ImageObject | Program.ImageObject[] | null
  export type IconObject = string | string[] | Program.IconObject | Program.IconObject[] | null
  export type EpisodeNumberObject =
    | string
    | number
    | Program.EpisodeNumberObject
    | Program.EpisodeNumberObject[]
    | null
  export type UrlObject = string | string[] | Program.UrlObject | Program.UrlObject[] | null
}
