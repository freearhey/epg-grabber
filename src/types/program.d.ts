declare namespace ProgramData {
  export interface TextObject {
    value: string
    lang?: string
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
    url: ProgramData.UrlObject[]
    image: ProgramData.ImageObject[]
  }

  export interface LenghtObject {
    units: string
    value: string
  }

  export interface EpisodeNumberObject {
    system?: string
    value?: string
  }

  export interface VideoObject {
    present?: string
    colour?: string
    aspect?: string
    quality?: string
  }

  export interface AudioObject {
    present?: string
    stereo?: string
  }

  export interface PreviouslyShownObject {
    start?: string
    channel?: string
  }

  export interface SubtitlesObject {
    type: string
    language: ProgramData.TextObject[]
  }

  export interface IconObject {
    src: string
    width?: string
    height?: string
  }

  export interface RatingObject {
    system: string
    icon: ProgramData.IconObject[]
    value: string
  }

  export interface ReviewObject {
    type?: string
    source?: string
    reviewer?: string
    lang?: string
    value?: string
  }
}

export interface ProgramData {
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
}
