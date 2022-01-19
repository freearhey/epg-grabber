#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const fs = require('fs')
const path = require('path')
const grabber = require('../src/index')
const utils = require('../src/utils')
const { name, version, description } = require('../package.json')
const { merge } = require('lodash')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

program
  .name(name)
  .version(version, '-v, --version')
  .description(description)
  .requiredOption('-c, --config <config>', 'Path to [site].config.js file')
  .option('-o, --output <output>', 'Path to output file')
  .option('--channels <channels>', 'Path to channels.xml file')
  .option('--lang <lang>', 'Set default language for all programs')
  .option('--days <days>', 'Number of days for which to grab the program', parseInteger, 1)
  .option('--delay <delay>', 'Delay between requests (in mileseconds)', parseInteger)
  .option('--timeout <timeout>', 'Set a timeout for each request (in mileseconds)', parseInteger)
  .option('--debug', 'Enable debug mode', false)
  .option('--log <log>', 'Path to log file')
  .option('--log-level <level>', 'Set log level', 'info')
  .parse(process.argv)

const options = program.opts()

const fileFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`
})

const consoleFormat = printf(({ level, message, timestamp }) => {
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

const logger = createLogger({
  level: options.logLevel,
  transports: t
})

async function main() {
  logger.info('Starting...')

  logger.info(`Loading '${options.config}'...`)
  let config = require(path.resolve(options.config))
  config = merge(config, {
    days: options.days,
    debug: options.debug,
    lang: options.lang,
    delay: options.delay,
    request: {
      timeout: options.timeout
    }
  })

  if (options.channels) config.channels = options.channels
  else if (config.channels)
    config.channels = path.join(path.dirname(options.config), config.channels)
  else throw new Error("The required 'channels' property is missing")

  if (!config.channels) return logger.error('Path to [site].channels.xml is missing')
  logger.info(`Loading '${config.channels}'...`)
  const channelsXML = fs.readFileSync(path.resolve(config.channels), { encoding: 'utf-8' })
  const channels = utils.parseChannels(channelsXML)

  let programs = []
  let i = 1
  let days = options.days || 1
  const total = channels.length * days
  for (let channel of channels) {
    await grabber
      .grab(channel, config, (data, err) => {
        logger.info(
          `[${i}/${total}] ${config.site} - ${data.channel.xmltv_id} - ${data.date.format(
            'MMM D, YYYY'
          )} (${data.programs.length} programs)`
        )

        if (err) logger.error(err.message)

        if (i < total) i++
      })
      .then(results => {
        programs = programs.concat(results)
      })
  }

  const xml = utils.convertToXMLTV({ config, channels, programs })
  const outputPath = options.output || config.output || 'guide.xml'
  utils.writeToFile(outputPath, xml)

  logger.info(`File '${outputPath}' successfully saved`)
  logger.info('Finish')
}

main()

function parseInteger(val) {
  return val ? parseInt(val) : null
}
