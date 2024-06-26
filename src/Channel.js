const { toArray } = require('./utils')

class Channel {
  constructor(c) {
    const data = {
      xmltv_id: c.xmltv_id,
      displayNames: toArray(c.displayNames || c.displayName || c.names || c.name).map(text =>
        toTextObject(text, c.lang)
      ),
      site: c.site || '',
      site_id: c.site_id,
      lang: c.lang || '',
      icons: toArray(c.icons || c.icon || c.logo).map(toIconObject),
      urls: toArray(c.urls || c.url || toURL(c.site)).map(toUrlObject),
      lcn: toArray(c.lcn).map(toTextObject)
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

function toTextObject(text, lang) {
  if (typeof text === 'string') {
    return { value: text, lang }
  }

  return {
    value: text.value,
    lang: text.lang
  }
}

function toIconObject(icon) {
  if (!icon) return { src: '' }
  if (typeof icon === 'string') return { src: icon }

  return {
    src: icon.src,
    width: icon.width,
    height: icon.height
  }
}

function toUrlObject(url) {
  if (typeof url === 'string') return { system: '', value: url }

  return {
    system: url.system || '',
    value: url.value || ''
  }
}
