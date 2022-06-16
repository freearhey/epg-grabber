const { padStart } = require('lodash')
const { toArray, toUnix, parseNumber } = require('./utils')

class Program {
	constructor(p) {
		const data = {
			channel: p.channel,
			title: p.title,
			sub_title: p.sub_title || '',
			description: [p.description, p.desc, ''].find(i => i !== undefined),
			icon: toIconObject(p.icon),
			episodeNumbers: getEpisodeNumbers(p.season, p.episode),
			date: p.date ? toUnix(p.date) : null,
			start: toUnix(p.start),
			stop: toUnix(p.stop),
			urls: toArray(p.urls || p.url).map(toUrlObject),
			ratings: toArray(p.ratings || p.rating).map(toRatingObject),
			categories: toArray(p.categories || p.category),
			directors: toArray(p.directors || p.director).map(toPersonObject),
			actors: toArray(p.actors || p.actor).map(toPersonObject),
			writers: toArray(p.writers || p.writer).map(toPersonObject),
			adapters: toArray(p.adapters || p.adapter).map(toPersonObject),
			producers: toArray(p.producers || p.producer).map(toPersonObject),
			composers: toArray(p.composers || p.composer).map(toPersonObject),
			editors: toArray(p.editors || p.editor).map(toPersonObject),
			presenters: toArray(p.presenters || p.presenter).map(toPersonObject),
			commentators: toArray(p.commentators || p.commentator).map(toPersonObject),
			guests: toArray(p.guests || p.guest).map(toPersonObject)
		}

		for (let key in data) {
			this[key] = data[key]
		}
	}
}

module.exports = Program

function toPersonObject(person) {
	if (typeof person === 'string') {
		return {
			value: person,
			url: [],
			image: []
		}
	}

	return {
		value: person.value,
		url: toArray(person.url).map(toUrlObject),
		image: toArray(person.image).map(toImageObject)
	}
}

function toImageObject(image) {
	if (typeof image === 'string') return { type: '', size: '', orient: '', system: '', value: image }

	return {
		type: image.type || '',
		size: image.size || '',
		orient: image.orient || '',
		system: image.system || '',
		value: image.value
	}
}

function toRatingObject(rating) {
	if (typeof rating === 'string') return { system: '', icon: '', value: rating }

	return {
		system: rating.system || '',
		icon: rating.icon || '',
		value: rating.value || ''
	}
}

function toUrlObject(url) {
	if (typeof url === 'string') return { system: '', value: url }

	return {
		system: url.system || '',
		value: url.value || ''
	}
}

function toIconObject(icon) {
	if (!icon || typeof icon === 'string') return { src: icon }

	return {
		src: icon.src || ''
	}
}

function getEpisodeNumbers(s, e) {
	s = parseNumber(s)
	e = parseNumber(e)

	return [createXMLTVNS(s, e), createOnScreen(s, e)].filter(Boolean)
}

function createXMLTVNS(s, e) {
	if (!e) return null
	s = s || 1

	return {
		system: 'xmltv_ns',
		value: `${s - 1}.${e - 1}.0/1`
	}
}

function createOnScreen(s, e) {
	if (!e) return null
	s = s || 1

	s = padStart(s, 2, '0')
	e = padStart(e, 2, '0')

	return {
		system: 'onscreen',
		value: `S${s}E${e}`
	}
}
