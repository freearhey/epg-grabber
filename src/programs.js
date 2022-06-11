const dayjs = require('dayjs')
const { isPromise } = require('./utils')

module.exports.parse = parse

async function parse(data) {
	const { config, channel } = data
	let programs = config.parser(data)

	if (isPromise(programs)) {
		programs = await programs
	}

	if (!Array.isArray(programs)) {
		throw new Error('Parser should return an array')
	}

	return programs
		.filter(i => i)
		.map(program => {
			program.channel = channel.xmltv_id

			return program
		})
}

function toBaseObject(data) {
	return data
}
