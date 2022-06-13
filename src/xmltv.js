const { padStart } = require('lodash')
const { escapeString, getUTCDate } = require('./utils')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports.generate = generate

function generate({ channels, programs, date = getUTCDate() }) {
	let output = `<?xml version="1.0" encoding="UTF-8" ?>`

	const elements = createElements(channels, programs, date)
	console.log(JSON.stringify(elements, null, 2))

	elements.forEach(elem => {
		output += toString(elem)
	})

	return output
}

const el = createElement

function createElements(channels, programs, date) {
	date = formatDate(date, 'YYYYMMDD')
	return [
		el('tv', { date }, [
			...channels.map(channel => {
				const url = channel.site ? `https://${channel.site}` : ''
				return el('channel', { id: channel.xmltv_id }, [
					el('display-name', {}, [channel.name]),
					el('icon', { src: channel.logo }),
					el('url', {}, [url])
				])
			}),
			...programs.map(program => {
				const lang = program.lang || 'en'
				return el(
					'programme',
					{
						start: formatDate(program.start, 'YYYYMMDDHHmmss ZZ'),
						stop: formatDate(program.stop, 'YYYYMMDDHHmmss ZZ'),
						channel: program.channel
					},
					[
						el('title', { lang }, [program.title]),
						el('sub-title', { lang }, [program.sub_title]),
						el('desc', { lang }, [program.description]),
						el('date', {}, [date]),
						el('icon', { src: program.icon }),
						el('url', {}, [program.url]),
						el('episode-num', { system: 'xmltv_ns' }, [
							formatEpisodeNum(program.season, program.episode, 'xmltv_ns')
						]),
						el('episode-num', { system: 'onscreen' }, [
							formatEpisodeNum(program.season, program.episode, 'onscreen')
						]),
						el('credits', {}, [
							...toArray(program.director).map(data => createCastMember('director', data)),
							...toArray(program.actor).map(data => createCastMember('actor', data)),
							...toArray(program.writer).map(data => createCastMember('writer', data)),
							...toArray(program.adapter).map(data => createCastMember('adapter', data)),
							...toArray(program.producer).map(data => createCastMember('producer', data)),
							...toArray(program.composer).map(data => createCastMember('composer', data)),
							...toArray(program.editor).map(data => createCastMember('editor', data)),
							...toArray(program.presenter).map(data => createCastMember('presenter', data)),
							...toArray(program.commentator).map(data => createCastMember('commentator', data)),
							...toArray(program.guest).map(data => createCastMember('guest', data))
						]),
						...toArray(program.category).map(category => el('category', { lang }, [category])),
						...toArray(program.rating).map(rating =>
							el('rating', { system: rating.system }, [
								el('value', {}, [rating.value]),
								el('icon', { src: rating.icon })
							])
						)
					]
				)
			})
		])
	]
}

function formatEpisodeNum(s, e, system) {
	switch (system) {
		case 'xmltv_ns':
			return createXMLTVNS(s, e)
		case 'onscreen':
			return createOnScreen(s, e)
	}

	return null
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

function createCastMember(position, data) {
	data = toObject(data)
	return el(position, {}, [
		data.value,
		...toArray(data.url).map(createURL),
		...toArray(data.image).map(createImage)
	])
}

function createImage(image) {
	image = toObject(image)
	return el(
		'image',
		{
			type: image.type,
			size: image.size,
			orient: image.orient,
			system: image.system
		},
		[image.value]
	)
}

function createURL(url) {
	url = toObject(url)
	return el('url', { system: url.system }, [url.value])
}

function toObject(value) {
	if (typeof value === 'string') return { value }

	return value
}

function toArray(value) {
	if (Array.isArray(value)) return value.filter(Boolean)

	return [value].filter(Boolean)
}

function formatDate(date, format) {
	return date ? dayjs.utc(date).format(format) : null
}

function createElement(name, attrs = {}, children = []) {
	return { name, attrs, children }
}

function toString(elem) {
	if (typeof elem === 'string') return escapeString(elem)

	let attrs = ''
	for (let key in elem.attrs) {
		let value = elem.attrs[key]
		if (value) {
			attrs += ` ${key}="${escapeString(value)}"`
		}
	}

	if (elem.children.length) {
		let children = ''
		elem.children.forEach(childElem => {
			children += toString(childElem)
		})

		return `<${elem.name}${attrs}>${children}</${elem.name}>`
	}

	if (!attrs) return ''

	return `<${elem.name}${attrs}/>`
}
