const convert = require('xml-js')
const Channel = require('./Channel')
const Program = require('./Program')
const { isPromise } = require('./utils')

module.exports.parseChannels = parseChannels
module.exports.parsePrograms = parsePrograms

function parseChannels(xml) {
  const result = convert.xml2js(xml)
  const siteTag = result.elements.find(el => el.name === 'site') || {}
  if (!siteTag.elements) return []
  const rootSite = siteTag.attributes.site

  const channelsTag = siteTag.elements.find(el => el.name === 'channels')
  if (!channelsTag.elements) return []

  const channels = channelsTag.elements
    .filter(el => el.name === 'channel')
    .map(el => {
      let { xmltv_id, site, logo } = el.attributes
      const name = el.elements.find(el => el.type === 'text').text
      if (!name) throw new Error(`Channel '${xmltv_id}' has no valid name`)
      site = site || rootSite

      return new Channel({ name, xmltv_id, logo, site })
    })

  return { site: rootSite, channels }
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
