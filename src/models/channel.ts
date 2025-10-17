import { toURL, escapeString, createXMLElement } from '../utils'
import { ChannelData } from '../types/channel'
import xmlJs from 'xml-js'

export class Channel {
  xmltv_id: string
  name: string
  site: string
  site_id: string
  lang: string | null
  logo: string | null
  url: string | null
  lcn: string | null
  index: number

  constructor(data: ChannelData) {
    this.xmltv_id = data.xmltv_id || data.site_id
    this.name = data.name
    this.site = data.site
    this.site_id = data.site_id
    this.lang = data.lang
    this.logo = data.logo
    this.url = data.url || toURL(data.site)
    this.lcn = data.lcn
    this.index = data.index !== undefined ? data.index : -1
  }

  static fromXmlJsElement(
    site: string,
    element: xmlJs.Element,
    index: number
  ): Channel | undefined {
    if (!element.elements) return
    const textElement = element.elements.find((element: xmlJs.Element) => element.type === 'text')
    if (!textElement || !textElement.text) return
    const attributes = element.attributes
    if (!attributes) return

    const channel = new Channel({
      xmltv_id: attributes.xmltv_id ? attributes.xmltv_id.toString() : '',
      name: textElement.text.toString(),
      site: attributes.site ? attributes.site.toString() : site,
      site_id: attributes.site_id ? attributes.site_id.toString() : '',
      lang: attributes.lang ? attributes.lang.toString() : null,
      logo: attributes.logo ? attributes.logo.toString() : null,
      url: attributes.url ? attributes.url.toString() : null,
      lcn: attributes.lcn ? attributes.lcn.toString() : null,
      index
    })

    return channel
  }

  toXML() {
    const el = createXMLElement

    return el('channel', { id: this.xmltv_id }, [
      el('display-name', {}, [escapeString(this.name)]),
      el('icon', { src: this.logo }, []),
      el('url', {}, [escapeString(this.url)]),
      el('lcn', {}, [escapeString(this.lcn)])
    ])
  }

  toObject(): ChannelData {
    return {
      xmltv_id: this.xmltv_id,
      name: this.name,
      site: this.site,
      site_id: this.site_id,
      lang: this.lang,
      logo: this.logo,
      url: this.url,
      lcn: this.lcn,
      index: this.index
    }
  }
}
