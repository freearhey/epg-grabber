const { padStart } = require('lodash')
const { escapeString, getUTCDate } = require('./utils')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports.generate = generate

function generate({ channels, programs, date = getUTCDate() }) {
	let output = `<?xml version="1.0" encoding="UTF-8" ?>`
	output += createElements(channels, programs, date)

	return output
}

const el = createElement

function createElements(channels, programs, date) {
	date = formatDate(date, 'YYYYMMDD')
	return el('tv', { date }, [
		...channels.map(channel => {
			const url = channel.site ? `https://${channel.site}` : ''

			return (
				'\r\n' +
				el('channel', { id: channel.xmltv_id }, [
					el('display-name', {}, [escapeString(channel.name)]),
					el('icon', { src: channel.logo }),
					el('url', {}, [url])
				])
			)
		}),
		...programs.map(program => {
			const lang = program.lang || 'en'
			const programDate = program.date ? formatDate(program.date, 'YYYYMMDD') : ''

			return (
				'\r\n' +
				el(
					'programme',
					{
						start: formatDate(program.start, 'YYYYMMDDHHmmss ZZ'),
						stop: formatDate(program.stop, 'YYYYMMDDHHmmss ZZ'),
						channel: program.channel
					},
					[
						el('title', { lang }, [escapeString(program.title)]),
						el('sub-title', { lang }, [escapeString(program.sub_title)]),
						el('desc', { lang }, [escapeString(program.description)]),
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
						el('date', {}, [programDate]),
						...toArray(program.category).map(category =>
							el('category', { lang }, [escapeString(category)])
						),
						el('icon', { src: program.icon }),
						...toArray(program.url).map(createURL),
						el('episode-num', { system: 'xmltv_ns' }, [
							formatEpisodeNum(program.season, program.episode, 'xmltv_ns')
						]),
						el('episode-num', { system: 'onscreen' }, [
							formatEpisodeNum(program.season, program.episode, 'onscreen')
						]),
						...toArray(program.rating).map(rating =>
							el('rating', { system: rating.system }, [
								el('value', {}, [rating.value]),
								el('icon', { src: rating.icon })
							])
						)
					]
				)
			)
		})
	])
}

function formatEpisodeNum(s, e, system) {
	switch (system) {
		case 'xmltv_ns':
			return createXMLTVNS(s, e)
		case 'onscreen':
			return createOnScreen(s, e)
	}

	return ''
}

function createXMLTVNS(s, e) {
	if (!e) return ''
	s = s || 1

	return `${s - 1}.${e - 1}.0/1`
}

function createOnScreen(s, e) {
	if (!e) return ''
	s = s || 1

	s = padStart(s, 2, '0')
	e = padStart(e, 2, '0')

	return `S${s}E${e}`
}

function createCastMember(position, data) {
	data = toObject(data)
	return el(position, {}, [
		escapeString(data.value),
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
	return toString({ name, attrs, children })
}

function toString(elem) {
	if (typeof elem === 'string') return elem

	let attrs = ''
	for (let key in elem.attrs) {
		let value = elem.attrs[key]
		if (value) {
			attrs += ` ${key}="${escapeString(value)}"`
		}
	}

	if (elem.children.filter(Boolean).length) {
		let children = ''
		elem.children.forEach(childElem => {
			children += toString(childElem)
		})

		return `<${elem.name}${attrs}>${children}</${elem.name}>`
	}

	if (!attrs) return ''
	if (!['icon'].includes(elem.name)) return ''

	return `<${elem.name}${attrs}/>`
}
