declare namespace Program {
  export type TextObject = {
    value: string
    lang?: string
  }

  export type UrlObject = {
    system: string
    value: string
  }

  export type ImageObject = {
    type: string
    size: string
    orient: string
    system: string
    value: string
  }

  export type PersonObject = {
    value: string
    url: Program.UrlObject[]
    image: Program.ImageObject[]
  }

  export type LenghtObject = {
    units: string
    value: string
  }

  export type EpisodeNumberObject = {
    system?: string
    value?: string
  }

  export type VideoObject = {
    present?: string
    colour?: string
    aspect?: string
    quality?: string
  }

  export type AudioObject = {
    present?: string
    stereo?: string
  }

  export type PreviouslyShownObject = {
    start?: string
    channel?: string
  }

  export type SubtitlesObject = {
    type: string
    language: Program.TextObject[]
  }

  export type IconObject = {
    src: string
    width?: string
    height?: string
  }

  export type RatingObject = {
    system: string
    icon: Program.IconObject[]
    value: string
  }

  export type ReviewObject = {
    type?: string
    source?: string
    reviewer?: string
    lang?: string
    value?: string
  }

  export type Data = {
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
  }
}
