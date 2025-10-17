import { SiteConfigOptions, SiteConfigProps, SiteConfigRequest } from './types/siteConfig'
import { sleep, isPromise, getUTCDate } from './utils'
import { XMLTVGenerator } from './core/xmltvGenerator'
import { ProgramsParser } from './core/programsParser'
import { ChannelsParser } from './core/channelsParser'
import { ChannelList } from './core/channelList'
import { SiteConfig } from './core/siteConfig'
import { Collection } from '@freearhey/core'
import { GrabCallback } from './types/index'
import { Channel, Program } from './models'
import { Client } from './core/client'
import { Logger } from './core/logger'
import { Dayjs } from 'dayjs'
import _ from 'lodash'

const parseChannels = ChannelsParser.parse
const parsePrograms = ProgramsParser.parse
const generateXMLTV = XMLTVGenerator.generate

export { generateXMLTV, parseChannels, parsePrograms, Channel, Program }

export class EPGGrabber {
  globalConfig?: SiteConfigProps
  client: Client
  logger: Logger

  constructor(globalConfig?: SiteConfigProps, options?: SiteConfigOptions) {
    const logger = options && options.logger ? options.logger : new Logger()

    this.globalConfig = globalConfig
    this.client = new Client(this.globalConfig, { logger })
    this.logger = logger

    logger.debug(`Config (global): ${JSON.stringify(globalConfig, null, 2)}`)
  }

  async loadLogo(context: SiteConfigRequest.Context): Promise<string> {
    if (
      !this.globalConfig ||
      !this.globalConfig.logo ||
      typeof this.globalConfig.logo !== 'function'
    )
      return ''

    const logo = this.globalConfig.logo(context)
    if (isPromise(logo)) {
      return await logo
    }
    return logo
  }

  async loadChannels() {
    if (!this.globalConfig) return new ChannelList({ channels: new Collection<Channel>() })

    const siteConfig = new SiteConfig(this.globalConfig)

    return ChannelList.load({ siteConfig, logger: this.logger })
  }

  async grab(
    channel: Channel,
    date: string | number | Date | Dayjs | null,
    config?: SiteConfigProps | GrabCallback,
    callback?: GrabCallback
  ) {
    if (!callback) callback = () => {}
    if (typeof config === 'function') {
      callback = config
      config = undefined
    }

    if (!(channel instanceof Channel)) {
      throw new Error('The first argument must be the "Channel" class')
    }

    const utcDate = getUTCDate(date)

    try {
      const configObject = config || this.globalConfig
      if (!configObject) throw new Error('Site config is missing')

      const siteConfig = new SiteConfig(configObject)

      siteConfig.update(this.globalConfig)

      this.logger.debug(`Config (local): ${JSON.stringify(siteConfig, null, 2)}`)

      siteConfig.validate()

      await sleep(siteConfig.delay)

      const requestContext = { channel, date: utcDate, siteConfig }
      const request = await Client.buildRequest(requestContext, { logger: this.logger })

      const response = await this.client.sendRequest(request)
      const programs = await ProgramsParser.parse({
        ...response,
        channel,
        date: utcDate,
        config: siteConfig
      })

      callback({ channel, date: utcDate, programs }, null)

      return programs
    } catch (error: unknown) {
      this.logger.debug(`Error: ${JSON.stringify(error, null, 2)}`)

      callback({ channel, date: utcDate, programs: [] }, error as Error)

      return []
    }
  }
}
