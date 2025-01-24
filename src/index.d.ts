import dayjs from 'dayjs'

export declare class Channel {
  xmltv_id?: string
  name: string
  site?: string
  site_id: string
  lang?: string
  logo?: string
}

type TextObject = {
  lang: string
  value: string
}

type IconObject = {
  src: string
}

type UrlObject = {
  system: string
  value: string
}

type RatingObject = {
  system: string
  icon: string
  value: string
}

type ImageObject = {
  type: string
  size: string
  orient: string
  system: string
  value: string
}

type PersonObject = {
  value: string
  url: UrlObject[]
  image: ImageObject[]
}

export declare class Program {
  site?: string
  channel?: string
  titles: TextObject[]
  sub_titles?: TextObject[]
  descriptions?: TextObject[]
  icon?: IconObject
  episodeNumbers?: string[]
  date?: number
  start: number
  stop?: number
  urls?: UrlObject[]
  ratings?: RatingObject[]
  categories?: TextObject[]
  directors?: PersonObject[]
  actors?: PersonObject[]
  writers?: PersonObject[]
  adapters?: PersonObject[]
  producers?: PersonObject[]
  composers?: PersonObject[]
  editors?: PersonObject[]
  presenters?: PersonObject[]
  commentators?: PersonObject[]
  guests?: PersonObject[]
}

export declare type SiteConfig = {
  site: string
  days?: number
  output?: string
  channels?: () => object[] | string | Promise<object[]>
  delay?: number
  maxConnections?: number
  request?: object
  url: () => string | string | Promise<string>
  logo?: () => string | string | Promise<string>
  parser: () => object[] | Promise<object[]>
}

export declare function generateXMLTV({
  channels,
  programs,
  date
}: {
  channels: Channel[]
  programs: Program[]
  date?: string | null
}): string

export declare function parseChannels(xml: string): { site: string; channels: Channel[] }

export type GrabCallbackData = {
  channel: Channel
  programs: Program[]
  date: dayjs.Dayjs
}

export declare class EPGGrabber {
  constructor(config?: SiteConfig)
  grab(
    channel: Channel,
    date: string | dayjs.Dayjs,
    config?: SiteConfig,
    cb?: (data: GrabCallbackData, err: Error | null) => void
  ): Promise<Program[]>
}

export declare class EPGGrabberMock {
  constructor(config?: SiteConfig)
  grab(
    channel: Channel,
    date: string | dayjs.Dayjs,
    config?: SiteConfig,
    cb?: (data: GrabCallbackData, err: Error | null) => void
  ): Promise<Program[]>
}
