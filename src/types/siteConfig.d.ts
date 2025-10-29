import { CacheRequestConfig } from 'axios-cache-interceptor'
import { ProgramParserResult } from './program'
import { AxiosResponseHeaders } from 'axios'
import { Logger } from '../core/logger'
import { Channel } from '../models'
import { Dayjs } from 'dayjs'

export interface SiteConfigOptions {
  logger: Logger
}

export interface SiteConfig {
  site?: string
  url?: ((context: SiteConfigRequestContext) => string | Promise<string>) | string
  parser?: (
    context: SiteConfigParserContext
  ) => ProgramParserResult[] | Promise<ProgramParserResult[]>
  days?: number
  delay?: number
  output?: string
  channels?: string | string[]
  request?: SiteConfigRequestConfig
  logo?: ((context: SiteConfigRequestContext) => string | Promise<string>) | string
  debug?: boolean
  curl?: boolean
  maxConnections?: number
  gzip?: boolean
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
  config: SiteConfig
  date: Dayjs
}
