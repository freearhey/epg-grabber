const fs = require('fs')
const path = require('path')

module.exports.read = read
module.exports.write = write
module.exports.resolve = resolve
module.exports.join = join
module.exports.dirname = dirname

function read(filepath) {
	return fs.readFileSync(path.resolve(filepath), { encoding: 'utf-8' })
}

function write(filepath, data) {
	const dir = path.resolve(path.dirname(filepath))
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}

	fs.writeFileSync(path.resolve(filepath), data)
}

function resolve(filepath) {
	return path.resolve(filepath)
}

function join(path1, path2) {
	return path.join(path1, path2)
}

function dirname(filepath) {
	return path.dirname(filepath)
}
