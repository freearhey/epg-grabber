const fs = require('fs')
const path = require('path')
const glob = require('glob')

module.exports.list = list
module.exports.read = read
module.exports.write = write
module.exports.resolve = resolve
module.exports.join = join
module.exports.dirname = dirname
module.exports.templateVariables = templateVariables
module.exports.templateFormat = templateFormat

function list(pattern) {
  return new Promise(resolve => {
    glob(pattern, function (err, files) {
      resolve(files)
    })
  })
}

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

function templateVariables(template) {
  const match = template.match(/{[^}]+}/g)

  return Array.isArray(match) ? match.map(s => s.substring(1, s.length - 1)) : []
}

function templateFormat(template, obj) {
  let output = template
  for (let key in obj) {
    const regex = new RegExp(`{${key}}`, 'g')
    const value = obj[key] || undefined
    output = output.replace(regex, value)
  }

  return output
}
