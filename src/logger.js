const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format
const path = require('path')

module.exports.create = create

function create(options) {
  const fileFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`
  })

  const consoleFormat = printf(({ level, message }) => {
    if (level === 'error') return `  Error: ${message}`

    return message
  })

  const t = [new transports.Console({ format: consoleFormat })]

  if (options.log) {
    t.push(
      new transports.File({
        filename: path.resolve(options.log),
        format: combine(timestamp(), fileFormat),
        options: { flags: 'w' }
      })
    )
  }

  return createLogger({
    level: options.logLevel,
    transports: t
  })
}
