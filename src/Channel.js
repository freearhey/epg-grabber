class Channel {
	constructor(c) {
		const data = {
			id: c.xmltv_id,
			name: c.name,
			site_id: c.site_id,
			site: c.site || '',
			lang: c.lang || '',
			logo: c.logo || '',
			url: c.site ? `https://${c.site}` : ''
		}

		for (let key in data) {
			this[key] = data[key]
		}
	}
}

module.exports = Channel
