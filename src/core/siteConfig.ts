import { SiteConfigParser, SiteConfigProps, SiteConfigRequest } from '../types/siteConfig'
import { CacheRequestConfig } from 'axios-cache-interceptor'
import { version, homepage } from '../../package.json'
import _ from 'lodash'

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
  request: Omit<CacheRequestConfig, 'headers' | 'data'> & SiteConfigRequest.Config
  site: string
  channels?: string | string[]
  url: ((context: SiteConfigRequest.Context) => string | Promise<string>) | string
  parser: (
    context: SiteConfigParser.Context
  ) => SiteConfigParser.Data[] | Promise<SiteConfigParser.Data[]>
  logo: ((context: SiteConfigRequest.Context) => string | Promise<string>) | string
  filepath: string

  constructor(props: SiteConfigProps) {
    this.site = props.site
    this.channels = props.channels
    this.url = props.url
    this.parser = props.parser
    this.filepath = props.filepath

    this.days = props.days || _default.days
    this.lang = props.lang || _default.lang
    this.delay = props.delay || _default.delay
    this.debug = props.debug || _default.debug
    this.maxConnections = props.maxConnections || _default.maxConnections
    this.gzip = props.gzip || _default.gzip
    this.curl = props.curl || _default.curl
    this.output = props.output || _default.output
    this.logo = props.logo || _default.logo

    this.request = _.merge(_default.request, props.request)
  }

  update(props?: SiteConfigProps): this {
    if (!props) return this

    if (props.site !== undefined) this.site = props.site
    if (props.channels !== undefined) this.channels = props.channels
    if (props.url !== undefined) this.url = props.url
    if (props.parser !== undefined) this.parser = props.parser
    if (props.filepath !== undefined) this.filepath = props.filepath
    if (props.days !== undefined) this.days = props.days
    if (props.lang !== undefined) this.lang = props.lang
    if (props.delay !== undefined) this.delay = props.delay
    if (props.debug !== undefined) this.debug = props.debug
    if (props.maxConnections !== undefined) this.maxConnections = props.maxConnections
    if (props.gzip !== undefined) this.gzip = props.gzip
    if (props.curl !== undefined) this.curl = props.curl
    if (props.output !== undefined) this.output = props.output
    if (props.logo !== undefined) this.logo = props.logo
    if (props.request !== undefined) this.request = _.merge(this.request, props.request)

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
}
