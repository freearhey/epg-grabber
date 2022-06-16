const { escapeString, getUTCDate, formatDate } = require('./utils')
const el = createElement

module.exports.generate = generate

function generate({ channels, programs, date = getUTCDate() }) {
	let output = `<?xml version="1.0" encoding="UTF-8" ?>`
	output += createElements(channels, programs, date)

	return output
}

function createElements(channels, programs, date) {
	return el('tv', { date: formatDate(date, 'YYYYMMDD') }, [
		...channels.map(channel => {
			return (
				'\r\n' +
				el('channel', { id: channel.id }, [
					el('display-name', {}, [escapeString(channel.name)]),
					el('icon', { src: channel.logo }),
					el('url', {}, [channel.url])
				])
			)
		}),
		...programs.map(program => {
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
						el('title', {}, [escapeString(program.title)]),
						el('sub-title', {}, [escapeString(program.sub_title)]),
						el('desc', {}, [escapeString(program.description)]),
						el('credits', {}, [
							...program.directors.map(data => createCastMember('director', data)),
							...program.actors.map(data => createCastMember('actor', data)),
							...program.writers.map(data => createCastMember('writer', data)),
							...program.adapters.map(data => createCastMember('adapter', data)),
							...program.producers.map(data => createCastMember('producer', data)),
							...program.composers.map(data => createCastMember('composer', data)),
							...program.editors.map(data => createCastMember('editor', data)),
							...program.presenters.map(data => createCastMember('presenter', data)),
							...program.commentators.map(data => createCastMember('commentator', data)),
							...program.guests.map(data => createCastMember('guest', data))
						]),
						el('date', {}, [formatDate(program.date, 'YYYYMMDD')]),
						...program.categories.map(category => el('category', {}, [escapeString(category)])),
						el('icon', { src: program.icon.src }),
						...program.urls.map(createURL),
						...program.episodeNumbers.map(episode =>
							el('episode-num', { system: episode.system }, [episode.value])
						),
						...program.ratings.map(rating =>
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

function createCastMember(position, data) {
	return el(position, {}, [
		escapeString(data.value),
		...data.url.map(createURL),
		...data.image.map(createImage)
	])
}

function createImage(image) {
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
	return el('url', { system: url.system }, [url.value])
}

function createElement(name, attrs = {}, children = []) {
	return toString({ name, attrs, children })
}

function toString(elem) {
	if (typeof elem === 'string' || typeof elem === 'number') return elem

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
