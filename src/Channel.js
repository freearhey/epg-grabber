class Channel {
	constructor(c) {
		const data = {
			id: c.xmltv_id,
			name: c.name,
			site: c.site || '',
			site_id: c.site_id,
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
