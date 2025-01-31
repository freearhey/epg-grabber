#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const { merge } = require('lodash')
const { gzip } = require('node-gzip')
const file = require('../src/file')
const { EPGGrabber, EPGGrabberMock, parseChannels, generateXMLTV } = require('../src/index')
const { create: createLogger } = require('../src/logger')
const { parseNumber, getUTCDate, parseProxy } = require('../src/utils')
const { name, version, description } = require('../package.json')
const _ = require('lodash')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const { TaskQueue } = require('cwait')
const { SocksProxyAgent } = require('socks-proxy-agent')

dayjs.extend(utc)

program
  .name(name)
  .version(version, '-v, --version')
  .description(description)
  .requiredOption('-c, --config <config>', 'Path to [site].config.js file')
  .option('-o, --output <output>', 'Path to output file')
  .option('-x, --proxy <url>', 'Use the specified proxy')
  .option('--channels <channels>', 'Path to list of channels')
  .option('--lang <lang>', 'Set default language for all programs')
  .option('--days <days>', 'Number of days for which to grab the program', parseNumber)
  .option('--delay <delay>', 'Delay between requests (in milliseconds)', parseNumber)
  .option('--timeout <timeout>', 'Set a timeout for each request (in milliseconds)', parseNumber)
  .option(
    '--max-connections <maxConnections>',
    'Set a limit on the number of concurrent requests per site',
    parseNumber
  )
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
    maxConnections: options.maxConnections,
    request: {}
  })

  if (options.timeout !== undefined) config.request.timeout = options.timeout
  if (options.cacheTtl !== undefined) config.request.cache.ttl = options.cacheTtl
  if (options.channels !== undefined) config.channels = options.channels
  if (options.proxy !== undefined) {
    const proxy = parseProxy(options.proxy)

    if (
      proxy.protocol &&
      ['socks', 'socks5', 'socks5h', 'socks4', 'socks4a'].includes(String(proxy.protocol))
    ) {
      const socksProxyAgent = new SocksProxyAgent(options.proxy)

      config.request = {
        ...config.request,
        ...{ httpAgent: socksProxyAgent, httpsAgent: socksProxyAgent }
      }
    } else {
      config.request = { ...config.request, ...{ proxy } }
    }
  }

  let parsedChannels = []
  if (config.channels) {
    const dir = file.dirname(options.config)

    let files = []
    if (Array.isArray(config.channels)) {
      files = config.channels.map(path => file.join(dir, path))
    } else if (typeof config.channels === 'string') {
      files = await file.list(config.channels)
    } else {
      throw new Error('The "channels" attribute must be of type array or string')
    }

    for (let filepath of files) {
      logger.info(`Loading '${filepath}'...`)
      const channelsXML = file.read(filepath)
      const channels = parseChannels(channelsXML)
      parsedChannels = parsedChannels.concat(channels)
    }
  } else throw new Error('Path to "channels" is missing')

  const grabber =
    process.env.NODE_ENV === 'test' ? new EPGGrabberMock(config) : new EPGGrabber(config)

  let template = options.output || config.output || 'guide.xml'
  const variables = file.templateVariables(template)

  const groups = _.groupBy(parsedChannels, channel => {
    let groupId = ''
    for (let key in channel) {
      if (variables.includes(key)) {
        groupId += channel[key]
      }
    }

    return groupId
  })

  for (let groupId in groups) {
    const channels = groups[groupId]
    let programs = []
    let i = 1
    let days = config.days || 1
    const maxConnections = config.maxConnections || 1
    const total = channels.length * days
    const utcDate = getUTCDate()
    const dates = Array.from({ length: days }, (_, i) => utcDate.add(i, 'd'))
    const taskQueue = new TaskQueue(Promise, maxConnections)

    let queue = []
    for (let channel of channels) {
      if (!channel.logo && config.logo) {
        channel.logo = await grabber.loadLogo(channel)
      }

      for (let date of dates) {
        queue.push({ channel, date })
      }
    }

    await Promise.all(
      queue.map(
        taskQueue.wrap(async ({ channel, date }) => {
          await grabber
            .grab(channel, date, (data, err) => {
              logger.info(
                `[${i}/${total}] ${config.site} - ${
                  data.channel.xmltv_id || data.channel.site_id
                } - ${dayjs.utc(data.date).format('MMM D, YYYY')} (${
                  data.programs.length
                } programs)`
              )

              if (err) logger.error(err.message)

              if (i < total) i++
            })
            .then(results => {
              programs = programs.concat(results)
            })
        })
      )
    )

    programs = _.uniqBy(programs, p => p.start + p.channel)

    const xml = generateXMLTV({ channels, programs })
    let outputPath = file.templateFormat(template, channels[0])
    if (options.gzip) {
      outputPath = outputPath || 'guide.xml.gz'
      const compressed = await gzip(xml)
      file.write(outputPath, compressed)
    } else {
      outputPath = outputPath || 'guide.xml'
      file.write(outputPath, xml)
    }

    logger.info(`File '${outputPath}' successfully saved`)
  }

  logger.info('Finish')
}

main()
