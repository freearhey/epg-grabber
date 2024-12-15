const convert = require('xml-js')
const Channel = require('./Channel')
const Program = require('./Program')
const { isPromise } = require('./utils')

module.exports.parseChannels = parseChannels
module.exports.parsePrograms = parsePrograms

function parseChannels(xml) {
  const result = convert.xml2js(xml)
  const siteTag = result.elements.find(el => el.name === 'site') || {}

  const channelsTag =
    siteTag && Array.isArray(siteTag.elements)
      ? siteTag.elements.find(el => el.name === 'channels')
      : result.elements.find(el => el.name === 'channels')
  if (!channelsTag || !channelsTag.elements) return []

  let rootSite = ''
  if (siteTag && siteTag.attributes && siteTag.attributes.site) {
    rootSite = siteTag.attributes.site
  } else if (channelsTag && channelsTag.attributes && channelsTag.attributes.site) {
    rootSite = channelsTag.attributes.site
  }

  const channels = channelsTag.elements
    .filter(el => el.name === 'channel')
    .map(el => {
      const c = el.attributes
      if (!Array.isArray(el.elements)) return
      c.name = el.elements.find(el => el.type === 'text').text
      c.site = c.site || rootSite
      if (!c.name) return

      return new Channel(c)
    })
    .filter(Boolean)

  return channels
}

async function parsePrograms(data) {
  const { config, channel } = data
  let programs = config.parser(data)

  if (isPromise(programs)) {
    programs = await programs
  }

  if (!Array.isArray(programs)) {
    throw new Error('Parser should return an array')
  }

  return programs.filter(i => i).map(p => new Program(p, channel))
}
