const convert = require('xml-js')

module.exports.parse = parse

function parse(xml) {
  const result = convert.xml2js(xml)
  const siteTag = result.elements.find(el => el.name === 'site') || {}
  if (!siteTag.elements) return []
  const site = siteTag.attributes.site

  const channelsTag = siteTag.elements.find(el => el.name === 'channels')
  if (!channelsTag.elements) return []

  const channels = channelsTag.elements
    .filter(el => el.name === 'channel')
    .map(el => {
      const channel = el.attributes
      if (!el.elements) throw new Error(`Channel '${channel.xmltv_id}' has no valid name`)
      channel.name = el.elements.find(el => el.type === 'text').text
      channel.site = channel.site || site

      return channel
    })

  return { site, channels }
}
