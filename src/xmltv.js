const { padStart } = require('lodash')
const { escapeString, getUTCDate } = require('./utils')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports.generate = generate

function generate({ channels, programs, date = getUTCDate() }) {
	let output = `<?xml version="1.0" encoding="UTF-8" ?><tv date="${dayjs(date).format(
		'YYYYMMDD'
	)}">\r\n`
	for (let channel of channels) {
		const id = escapeString(channel['xmltv_id'])
		const displayName = escapeString(channel.name)
		output += `<channel id="${id}"><display-name>${displayName}</display-name>`
		if (channel.logo) {
			const logo = escapeString(channel.logo)
			output += `<icon src="${logo}"/>`
		}
		if (channel.site) {
			const url = channel.site ? 'https://' + channel.site : null
			output += `<url>${url}</url>`
		}
		output += `</channel>\r\n`
	}

	for (let program of programs) {
		if (!program) continue

		const channel = escapeString(program.channel)
		const title = escapeString(program.title)
		const description = escapeString(program.description)
		const categories = Array.isArray(program.category) ? program.category : [program.category]
		const start = program.start ? dayjs.unix(program.start).utc().format('YYYYMMDDHHmmss ZZ') : ''
		const stop = program.stop ? dayjs.unix(program.stop).utc().format('YYYYMMDDHHmmss ZZ') : ''
		const lang = program.lang || 'en'
		const xmltv_ns = createXMLTVNS(program.season, program.episode)
		const onscreen = createOnScreen(program.season, program.episode)
		const date = program.date || ''
		const credits = createCredits({
			director: program.director,
			actor: program.actor,
			writer: program.writer,
			adapter: program.adapter,
			producer: program.producer,
			composer: program.composer,
			editor: program.editor,
			presenter: program.presenter,
			commentator: program.commentator,
			guest: program.guest
		})
		const icon = escapeString(program.icon)
		const sub_title = escapeString(program.sub_title)
		const url = program.url ? createURL(program.url, channel) : ''

		if (start && stop && title) {
			output += `<programme start="${start}" stop="${stop}" channel="${channel}"><title lang="${lang}">${title}</title>`

			if (sub_title) {
				output += `<sub-title>${sub_title}</sub-title>`
			}

			if (description) {
				output += `<desc lang="${lang}">${description}</desc>`
			}

			if (categories.length) {
				categories.forEach(category => {
					if (category) {
						output += `<category lang="${lang}">${escapeString(category)}</category>`
					}
				})
			}

			if (url) {
				output += url
			}

			if (xmltv_ns) {
				output += `<episode-num system="xmltv_ns">${xmltv_ns}</episode-num>`
			}

			if (onscreen) {
				output += `<episode-num system="onscreen">${onscreen}</episode-num>`
			}
			if (date) {
				output += `<date>${date}</date>`
			}

			if (icon) {
				output += `<icon src="${icon}"/>`
			}

			if (credits) {
				output += `<credits>${credits}</credits>`
			}

			output += '</programme>\r\n'
		}
	}

	output += '</tv>'

	return output
}

function createXMLTVNS(s, e) {
	if (!e) return null
	s = s || 1

	return `${s - 1}.${e - 1}.0/1`
}

function createOnScreen(s, e) {
	if (!e) return null
	s = s || 1

	s = padStart(s, 2, '0')
	e = padStart(e, 2, '0')

	return `S${s}E${e}`
}

function createURL(urlObj, channel = '') {
	const urls = Array.isArray(urlObj) ? urlObj : [urlObj]
	let output = ''
	for (let url of urls) {
		if (typeof url === 'string' || url instanceof String) {
			url = { value: url }
		}

		let attr = url.system ? ` system="${url.system}"` : ''
		if (url.value.includes('http')) {
			output += `<url${attr}>${url.value}</url>`
		} else if (channel) {
			let chan = channels.find(c => c.xmltv_id.localeCompare(channel) === 0)
			if (chan && chan.site) {
				output += `<url${attr}>https://${chan.site}${url.value}</url>`
			}
		}
	}

	return output
}

function createImage(imgObj, channel = '') {
	const imgs = Array.isArray(imgObj) ? imgObj : [imgObj]
	let output = ''
	for (let img of imgs) {
		if (typeof img === 'string' || img instanceof String) {
			img = { value: img }
		}

		const imageTypes = ['poster', 'backdrop', 'still', 'person', 'character']
		const imageSizes = ['1', '2', '3']
		const imageOrients = ['P', 'L']

		let attr = ''

		if (img.type && imageTypes.some(el => img.type.includes(el))) {
			attr += ` type="${img.type}"`
		}

		if (img.size && imageSizes.some(el => img.size.includes(el))) {
			attr += ` size="${img.size}"`
		}

		if (img.orient && imageOrients.some(el => img.orient.includes(el))) {
			attr += ` orient="${img.orient}"`
		}

		if (img.system) {
			attr += ` system="${img.system}"`
		}

		if (img.value.includes('http')) {
			output += `<image${attr}>${img.value}</image>`
		} else if (channel) {
			let chan = channels.find(c => c.xmltv_id.localeCompare(channel) === 0)
			if (chan && chan.site) {
				output += `<image${attr}>https://${chan.site}${img.value}</image>`
			}
		}
	}

	return output
}

function createCredits(obj) {
	let cast = Object.entries(obj)
		.filter(x => x[1])
		.map(([name, value]) => ({ name, value }))

	let output = ''
	for (let type of cast) {
		const r = Array.isArray(type.value) ? type.value : [type.value]
		for (let person of r) {
			if (typeof person === 'string' || person instanceof String) {
				person = { value: person }
			}

			let attr = ''
			if (type.name.localeCompare('actor') === 0 && type.value.role) {
				attr += ` role="${type.value.role}"`
			}
			if (type.name.localeCompare('actor') === 0 && type.value.guest) {
				attr += ` guest="${type.value.guest}"`
			}
			output += `<${type.name}${attr}>${person.value}`

			if (person.url) {
				output += createURL(person.url)
			}
			if (person.image) {
				output += createImage(person.image)
			}

			output += `</${type.name}>`
		}
	}
	return output
}
