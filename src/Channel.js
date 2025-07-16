class Channel {
  constructor(c) {
    const data = {
      xmltv_id: c.xmltv_id,
      name: c.name,
      site: c.site || '',
      site_id: c.site_id,
      lang: c.lang || '',
      icon: c.icon || c.logo || '',
      url: c.url || toURL(c.site),
      lcn: c.lcn !== undefined ? +c.lcn : undefined,
      index: c.index !== undefined ? c.index : -1
    }

    for (let key in data) {
      this[key] = data[key]
    }
  }
}

module.exports = Channel

function toURL(site) {
  return site ? `https://${site}` : ''
}
