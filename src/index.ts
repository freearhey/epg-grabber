import { sleep, getUTCDate, isPromise, isDate, createXMLElement, formatDate } from './core/utils'
import { ProgramParserResult } from './types/program'
import AxiosMockAdapter from 'axios-mock-adapter'
import { SiteConfig } from './types/siteConfig'
import { GrabCallback } from './types/index'
import defaultConfig from './default.config'
import { Channel, Program } from './models'
import { Client } from './core/client'
import type * as Types from './types'
import merge from 'lodash.merge'
import { Dayjs } from 'dayjs'
import xmlJs from 'xml-js'

export { Channel, Program, Types }

export class EPGGrabber {
  globalConfig: SiteConfig = {}
  client: Client

  constructor(config: SiteConfig = {}) {
    this.globalConfig = config
    this.client = new Client()
  }

  async loadLogo(
    channel: Channel,
    date: string | number | Date | Dayjs | null,
    config: SiteConfig = {}
  ): Promise<string | null> {
    if (!(channel instanceof Channel))
      throw new Error('The first argument must be the "Channel" class')

    config = merge({}, defaultConfig, config, this.globalConfig)

    if (typeof config.logo !== 'function') return null

    const requestContext = { channel, date: getUTCDate(date), config }

    const logo = config.logo(requestContext)
    if (isPromise(logo)) {
      return await logo
    }
    return logo
  }

  async grab(
    channel: Channel,
    date: string | number | Date | Dayjs | null,
    config: SiteConfig | GrabCallback = {},
    callback: GrabCallback = () => {}
  ): Promise<Program[]> {
    if (!(channel instanceof Channel))
      throw new Error('The first argument must be the "Channel" class')

    if (typeof config === 'function') {
      callback = config
      config = {}
    }

    const utcDate = getUTCDate(date)

    config = merge({}, defaultConfig, config, this.globalConfig)

    if (!config.parser) throw new Error('Could not find parser() in the config file')
    if (!config.site) throw new Error("The required 'site' property is missing")
    if (!config.url) throw new Error("The required 'url' property is missing")
    if (typeof config.url !== 'function' && typeof config.url !== 'string')
      throw new Error("The 'url' property should return the function or string")
    if (!config.parser) throw new Error("The required 'parser' function is missing")
    if (typeof config.parser !== 'function')
      throw new Error("The 'parser' property should return the function")
    if (config.logo && typeof config.logo !== 'function')
      throw new Error("The 'logo' property should return the function")

    try {
      if (typeof config.delay === 'number') await sleep(config.delay)

      const requestContext = { channel, date: utcDate, config }

      const request = await Client.buildRequest(requestContext)

      const response = await this.client.sendRequest(request)

      const parserContext = {
        ...response,
        channel,
        date: utcDate,
        config
      }
      let parsedPrograms = config.parser(parserContext)

      if (isPromise(parsedPrograms)) {
        parsedPrograms = await parsedPrograms
      }

      const programs = (parsedPrograms as ProgramParserResult[])
        .filter(Boolean)
        .map((data: ProgramParserResult) => Program.fromParserResult(data, channel))

      callback({ channel, date: utcDate, programs }, null)

      return programs
    } catch (error: unknown) {
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
    config: SiteConfig | GrabCallback = {},
    callback: GrabCallback = () => {}
  ): Promise<Program[]> {
    if (typeof config === 'function') {
      callback = config
      config = {}
    }

    const utcDate = getUTCDate(date)

    config = merge({}, defaultConfig, config, this.globalConfig)

    if (!config.parser) throw new Error('Could not find parser() in the config file')

    try {
      const requestContext = { channel, date: utcDate, config }

      const request = await Client.buildRequest(requestContext)

      const mock = new AxiosMockAdapter(this.client.instance)

      mock.onAny().reply(200, Buffer.from(JSON.stringify([]), 'utf8'))

      const response = await this.client.sendRequest(request)

      const parserContext = {
        ...response,
        channel,
        date: utcDate,
        config
      }

      let parsedPrograms = config.parser(parserContext)
      if (isPromise(parsedPrograms)) {
        parsedPrograms = await parsedPrograms
      }

      const programs = (parsedPrograms as ProgramParserResult[])
        .filter(Boolean)
        .map((data: ProgramParserResult) => Program.fromParserResult(data, channel))

      callback({ channel, date: utcDate, programs }, null)

      return programs
    } catch (error: unknown) {
      callback({ channel, date: utcDate, programs: [] }, error as Error)

      return []
    }
  }
}
