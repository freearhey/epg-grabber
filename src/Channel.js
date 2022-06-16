class Channel {
	constructor(c) {
		const data = {
			id: c.id || c.xmltv_id,
			name: c.name,
			site: c.site || '',
			site_id: c.site_id,
			lang: c.lang || '',
			logo: c.logo || '',
			url: c.url || toURL(c.site)
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
