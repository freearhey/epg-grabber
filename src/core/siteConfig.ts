import { CacheRequestConfig } from 'axios-cache-interceptor'
import { version, homepage } from '../../package.json'
import { Collection } from '@freearhey/core'
import { getAbsPath } from './utils'
import { glob } from 'glob'
import path from 'node:path'
import _ from 'lodash'
import {
  SiteConfigParserContext,
  SiteConfigParserResult,
  SiteConfigObject,
  SiteConfigRequestContext,
  SiteConfigRequestConfig
} from '../types/siteConfig'

const _default = {
  days: 1,
  lang: 'en',
  delay: 3000,
  debug: false,
  curl: false,
  gzip: false,
  maxConnections: 1,
  output: 'guide.xml',
  request: {
    method: 'GET',
    maxContentLength: 5 * 1024 * 1024,
    timeout: 5000,
    withCredentials: true,
    responseType: 'arraybuffer',
    cache: false,
    headers: {
      'User-Agent': `EPGGrabber/${version} (${homepage})`
    }
  },
  logo: ''
}

export class SiteConfig {
  days: number
  lang: string
  delay: number
  debug: boolean
  gzip: boolean
  curl: boolean
  maxConnections: number
  output: string
  request: Omit<CacheRequestConfig, 'headers' | 'data'> & SiteConfigRequestConfig
  site: string
  channels?: string | string[]
  url: ((context: SiteConfigRequestContext) => string | Promise<string>) | string
  parser: (
    context: SiteConfigParserContext
  ) => SiteConfigParserResult[] | Promise<SiteConfigParserResult[]>
  logo: ((context: SiteConfigRequestContext) => string | Promise<string>) | string
  filepath: string

  constructor(config: SiteConfigObject) {
    this.site = config.site
    this.channels = config.channels
    this.url = config.url
    this.parser = config.parser
    this.filepath = config.filepath

    this.days = config.days || _default.days
    this.lang = config.lang || _default.lang
    this.delay = config.delay || _default.delay
    this.debug = config.debug || _default.debug
    this.maxConnections = config.maxConnections || _default.maxConnections
    this.gzip = config.gzip || _default.gzip
    this.curl = config.curl || _default.curl
    this.output = config.output || _default.output
    this.logo = config.logo || _default.logo

    this.request = _.merge(_default.request, config.request)
  }

  update(config?: SiteConfigObject): this {
    if (!config) return this

    if (config.site !== undefined) this.site = config.site
    if (config.channels !== undefined) this.channels = config.channels
    if (config.url !== undefined) this.url = config.url
    if (config.parser !== undefined) this.parser = config.parser
    if (config.filepath !== undefined) this.filepath = config.filepath
    if (config.days !== undefined) this.days = config.days
    if (config.lang !== undefined) this.lang = config.lang
    if (config.delay !== undefined) this.delay = config.delay
    if (config.debug !== undefined) this.debug = config.debug
    if (config.maxConnections !== undefined) this.maxConnections = config.maxConnections
    if (config.gzip !== undefined) this.gzip = config.gzip
    if (config.curl !== undefined) this.curl = config.curl
    if (config.output !== undefined) this.output = config.output
    if (config.logo !== undefined) this.logo = config.logo
    if (config.request !== undefined) this.request = _.merge(this.request, config.request)

    return this
  }

  validate() {
    if (!this.filepath) throw new Error("The required 'filepath' property is missing")
    if (!this.site) throw new Error("The required 'site' property is missing")
    if (!this.url) throw new Error("The required 'url' property is missing")
    if (typeof this.url !== 'function' && typeof this.url !== 'string')
      throw new Error("The 'url' property should return the function or string")
    if (!this.parser) throw new Error("The required 'parser' function is missing")
    if (typeof this.parser !== 'function')
      throw new Error("The 'parser' property should return the function")
    if (this.logo && typeof this.logo !== 'function')
      throw new Error("The 'logo' property should return the function")
  }

  async getChannelFiles(): Promise<Collection<string>> {
    let files: string[] = []

    if (!this.channels) throw new Error('Path to "channels" is missing')

    const rootDir = path.dirname(this.filepath)
    if (Array.isArray(this.channels)) {
      files = this.channels.map((filepath: string) => getAbsPath(filepath, rootDir))
    } else if (typeof this.channels === 'string') {
      const absPath = getAbsPath(this.channels, rootDir)
      files = await glob(absPath)
    } else {
      throw new Error('The "channels" attribute must be of type array or string')
    }

    return new Collection(files)
  }
}
