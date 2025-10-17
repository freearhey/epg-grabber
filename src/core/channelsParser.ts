import { Channel } from '../models/channel'
import xmlJs from 'xml-js'

export class ChannelsParser {
  static parse(xml: string): Channel[] {
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
}
