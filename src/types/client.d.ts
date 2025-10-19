import { CacheAxiosResponse } from 'axios-cache-interceptor'
import { SiteConfig } from '../core/siteConfig'
import { AxiosResponseHeaders } from 'axios'
import { Channel } from '../models/channel'
import { Dayjs } from 'dayjs'

export interface ClientRequestConfig {
  channel: Channel
  date: Dayjs
  siteConfig: SiteConfig
}

export interface ClientResponse {
  content: string
  buffer: Buffer
  headers: AxiosResponseHeaders | Partial<AxiosResponseHeaders>
  request: CacheAxiosResponse
  cached: boolean
}
