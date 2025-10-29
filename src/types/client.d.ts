import { CacheAxiosResponse } from 'axios-cache-interceptor'
import { AxiosResponseHeaders } from 'axios'
import { Channel } from '../models/channel'
import { SiteConfig } from './siteConfig'
import { Dayjs } from 'dayjs'

export interface ClientRequestContext {
  channel: Channel
  date: Dayjs
  config: SiteConfig
}

export interface ClientResponse {
  content: string
  buffer: Buffer
  headers: AxiosResponseHeaders | Partial<AxiosResponseHeaders>
  request: CacheAxiosResponse
  cached: boolean
}
