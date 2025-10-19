import { sleep, getUTCDate, isPromise, isDate, createXMLElement, formatDate } from './core/utils'
import { SiteConfigOptions, SiteConfigObject, SiteConfigParserResult } from './types/siteConfig'
import { SiteConfig } from './core/siteConfig'
import { Collection } from '@freearhey/core'
import { GrabCallback } from './types/index'
import { Channel, Program } from './models'
import { Client } from './core/client'
import { Logger } from './core/logger'
import type * as Types from './types'
import { Dayjs } from 'dayjs'
import xmlJs from 'xml-js'
import fs from 'fs-extra'
import _ from 'lodash'

export { Channel, Program, Types }

export class EPGGrabber {
  globalConfig?: SiteConfigObject
  client: Client
  logger: Logger

  constructor(globalConfig?: SiteConfigObject, options?: SiteConfigOptions) {
    const logger = options && options.logger ? options.logger : new Logger()

    this.globalConfig = globalConfig
    this.client = new Client({ logger })
    this.logger = logger

    logger.debug(`Config (global): ${JSON.stringify(globalConfig, null, 2)}`)
  }

  async loadChannels(config?: SiteConfigObject): Promise<Channel[]> {
    const configObject = config || this.globalConfig

    if (!configObject) throw new Error('Site config is missing')

    const siteConfig = new SiteConfig(configObject)

    const channels = new Collection<Channel>()

    const files = await siteConfig.getChannelFiles()

    files.forEach((filepath: string) => {
      const channelsXML = fs.readFileSync(filepath, 'utf8')
      const channelsFromXML = EPGGrabber.parseChannelsXML(channelsXML)
      channels.concat(new Collection(channelsFromXML))
    })

    return channels.all()
  }

  async loadLogo(
    channel: Channel,
    date: string | number | Date | Dayjs | null,
    config?: SiteConfigObject
  ): Promise<string> {
    if (!(channel instanceof Channel)) {
      throw new Error('The first argument must be the "Channel" class')
    }

    const configObject = config || this.globalConfig

    if (!configObject) throw new Error('Site config is missing')

    if (!configObject.logo || typeof configObject.logo !== 'function') return ''

    const context = { channel, date: getUTCDate(date) }
    const logo = configObject.logo(context)
    if (isPromise(logo)) {
      return await logo
    }
    return logo
  }

  async grab(
    channel: Channel,
    date: string | number | Date | Dayjs | null,
    config?: SiteConfigObject | GrabCallback,
    callback?: GrabCallback
  ): Promise<Program[]> {
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

      if (!siteConfig.parser) {
        throw new Error('Could not find parser() in the config file')
      }

      const parserContext = {
        ...response,
        channel,
        date: utcDate,
        config: siteConfig
      }
      let parsedPrograms = siteConfig.parser(parserContext)

      if (isPromise(parsedPrograms)) {
        parsedPrograms = await parsedPrograms
      }

      const programs = await EPGGrabber.parseParserResults(
        parsedPrograms as SiteConfigParserResult[],
        channel
      )

      callback({ channel, date: utcDate, programs }, null)

      return programs
    } catch (error: unknown) {
      this.logger.debug(`Error: ${JSON.stringify(error, null, 2)}`)

      callback({ channel, date: utcDate, programs: [] }, error as Error)

      return []
    }
  }

  static parseChannelsXML(xml: string): Channel[] {
    const result = xmlJs.xml2js(xml)
    const siteTag = result.elements.find((element: xmlJs.Element) => element.name === 'site') || {}
    const channelsTag =
      siteTag && Array.isArray(siteTag.elements)
        ? siteTag.elements.find((element: xmlJs.Element) => element.name === 'channels')
        : result.elements.find((element: xmlJs.Element) => element.name === 'channels')
    if (!channelsTag || !channelsTag.elements) return []

    let site = ''
    if (siteTag && siteTag.attributes && siteTag.attributes.site) {
      site = siteTag.attributes.site
    } else if (channelsTag && channelsTag.attributes && channelsTag.attributes.site) {
      site = channelsTag.attributes.site
    }

    const channels = channelsTag.elements
      .filter((element: xmlJs.Element) => element.name === 'channel')
      .map((element: xmlJs.Element, index: number) =>
        Channel.fromXmlJsElement(site, element, index)
      )
      .filter(Boolean)

    return channels
  }

  static async parseParserResults(
    results: SiteConfigParserResult[],
    channel: Channel
  ): Promise<Program[]> {
    if (!Array.isArray(results)) {
      throw new Error('Parser should return an array')
    }

    return results
      .filter(Boolean)
      .map((data: SiteConfigParserResult) => Program.fromParserResult(data, channel))
  }

  static generateXMLTV(
    channels: Channel[],
    programs: Program[],
    date: Dayjs = getUTCDate()
  ): string {
    if (!channels.every((channel: Channel) => channel instanceof Channel)) {
      throw new Error('"channels" must be an array of Channels')
    }

    if (!programs.every((program: Program) => program instanceof Program)) {
      throw new Error('"programs" must be an array of Programs')
    }

    if (!isDate(date)) {
      throw new Error('"date" must be a valid date')
    }

    let output = `<?xml version="1.0" encoding="UTF-8" ?>`
    output += createXMLElement('tv', { date: formatDate(date, 'YYYYMMDD') }, [
      ...channels.map((channel: Channel) => '\r\n' + channel.toXML()),
      ...programs.map((program: Program) => '\r\n' + program.toXML()),
      '\r\n'
    ])

    return output
  }
}

export class EPGGrabberMock extends EPGGrabber {
  override async grab(
    channel: Channel,
    date: string | number | Date | Dayjs | null,
    config?: SiteConfigObject | GrabCallback,
    callback?: GrabCallback
  ): Promise<Program[]> {
    return []
  }
}
