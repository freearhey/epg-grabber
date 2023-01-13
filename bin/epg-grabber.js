#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const { merge } = require('lodash')
const { gzip } = require('node-gzip')
const file = require('../src/file')
const { EPGGrabber, parseChannels, generateXMLTV } = require('../src/index')
const { create: createLogger } = require('../src/logger')
const { parseNumber, getUTCDate } = require('../src/utils')
const { name, version, description } = require('../package.json')
const _ = require('lodash')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

program
  .name(name)
  .version(version, '-v, --version')
  .description(description)
  .requiredOption('-c, --config <config>', 'Path to [site].config.js file')
  .option('-o, --output <output>', 'Path to output file')
  .option('--channels <channels>', 'Path to channels.xml file')
  .option('--lang <lang>', 'Set default language for all programs')
  .option('--days <days>', 'Number of days for which to grab the program', parseNumber)
  .option('--delay <delay>', 'Delay between requests (in milliseconds)', parseNumber)
  .option('--timeout <timeout>', 'Set a timeout for each request (in milliseconds)', parseNumber)
  .option(
    '--cache-ttl <cacheTtl>',
    'Maximum time for storing each request (in milliseconds)',
    parseNumber
  )
  .option('--gzip', 'Compress the output', false)
  .option('--debug', 'Enable debug mode', false)
  .option('--curl', 'Display request as CURL', false)
  .option('--log <log>', 'Path to log file')
  .option('--log-level <level>', 'Set log level', 'info')
  .parse(process.argv)

const options = program.opts()
const logger = createLogger(options)

async function main() {
  logger.info('Starting...')

  logger.info(`Loading '${options.config}'...`)
  let config = require(file.resolve(options.config))
  config = merge(config, {
    days: options.days,
    debug: options.debug,
    gzip: options.gzip,
    curl: options.curl,
    lang: options.lang,
    delay: options.delay,
    request: {}
  })

  if (options.timeout) config.request.timeout = options.timeout
  if (options.cacheTtl) config.request.cache.ttl = options.cacheTtl
  if (options.channels) config.channels = options.channels
  else if (config.channels)
    config.channels = file.join(file.dirname(options.config), config.channels)
  else throw new Error("The required 'channels' property is missing")

  if (!config.channels) return logger.error('Path to [site].channels.xml is missing')
  logger.info(`Loading '${config.channels}'...`)
  const grabber = new EPGGrabber(config)

  const channelsXML = file.read(config.channels)
  const { channels } = parseChannels(channelsXML)

  let programs = []
  let i = 1
  let days = config.days || 1
  const total = channels.length * days
  const utcDate = getUTCDate()
  const dates = Array.from({ length: days }, (_, i) => utcDate.add(i, 'd'))
  for (let channel of channels) {
    if (!channel.logo && config.logo) {
      channel.logo = await grabber.loadLogo(channel)
    }

    for (let date of dates) {
      await grabber
        .grab(channel, date, (data, err) => {
          logger.info(
            `[${i}/${total}] ${config.site} - ${data.channel.id} - ${dayjs
              .utc(data.date)
              .format('MMM D, YYYY')} (${data.programs.length} programs)`
          )

          if (err) logger.error(err.message)

          if (i < total) i++
        })
        .then(results => {
          programs = programs.concat(results)
        })
    }
  }

  programs = _.uniqBy(programs, p => p.start + p.channel)

  const xml = generateXMLTV({ channels, programs })
  let outputPath = options.output || config.output
  if (options.gzip) {
    outputPath = outputPath || 'guide.xml.gz'
    const compressed = await gzip(xml)
    file.write(outputPath, compressed)
  } else {
    outputPath = outputPath || 'guide.xml'
    file.write(outputPath, xml)
  }

  logger.info(`File '${outputPath}' successfully saved`)
  logger.info('Finish')
}

main()
