#! /usr/bin/env node

import { parseNumber, getUTCDate, loadJs, parseProxy } from './core/utils'
import { Collection, Dictionary, Template } from '@freearhey/core'
import { name, version, description } from '../package.json'
import { Command, OptionValues, Option } from 'commander'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { Program, Channel } from './models'
import { Logger } from './core/logger'
import { EPGGrabber } from './index'
import { TaskQueue } from 'cwait'
import Promise from 'bluebird'
import { Dayjs } from 'dayjs'
import path from 'node:path'
import fs from 'fs-extra'
import pako from 'pako'
import _ from 'lodash'

const program = new Command()

type QueueItem = {
  channel: Channel
  date: Dayjs
}

program
  .name(name)
  .version(version, '-v, --version')
  .description(description)
  .addOption(
    new Option('-c, --config <config>', 'Path to [site].config.js file').makeOptionMandatory()
  )
  .addOption(new Option('-o, --output <output>', 'Path to output file').default('guide.xml'))
  .addOption(new Option('-x, --proxy <url>', 'Use the specified proxy'))
  .addOption(new Option('--channels <channels>', 'Path to list of channels'))
  .addOption(new Option('--lang <lang>', 'Set default language for all programs'))
  .addOption(
    new Option('--days <days>', 'Number of days for which to grab the program')
      .argParser(parseNumber)
      .default(1)
  )
  .addOption(
    new Option('--delay <delay>', 'Delay between requests (in milliseconds)')
      .argParser(parseNumber)
      .default(3000)
  )
  .addOption(
    new Option('--timeout <timeout>', 'Set a timeout for each request (in milliseconds)')
      .argParser(parseNumber)
      .default(5000)
  )
  .addOption(
    new Option(
      '--max-connections <maxConnections>',
      'Set a limit on the number of concurrent requests per site'
    )
      .argParser(parseNumber)
      .default(1)
  )
  .addOption(
    new Option(
      '--cache-ttl <cacheTtl>',
      'Maximum time for storing each request (in milliseconds)'
    ).argParser(parseNumber)
  )
  .addOption(new Option('--gzip', 'Compress the output').default(false))
  .addOption(new Option('--debug', 'Enable debug mode').default(false))
  .addOption(new Option('--curl', 'Display request as CURL').default(false))
  .addOption(new Option('--log <log>', 'Path to log file'))
  .addOption(new Option('--log-level <level>', 'Set log level').default('info'))
  .parse(process.argv)

const options: OptionValues = program.opts()
const logger = new Logger({
  log: options.log,
  logLevel: options.debug ? 'debug' : options.logLevel
})

async function main() {
  logger.info('Starting...')

  logger.debug(`Options: ${JSON.stringify(options, null, 2)}`)

  logger.info(`Loading '${options.config}'...`)
  let configObject = await loadJs(options.config)

  configObject = _.merge(configObject, {
    filepath: path.resolve(options.config),
    channels: typeof options.channels === 'string' ? path.resolve(options.channels) : undefined,
    request: {}
  })

  if (configObject.output === undefined) configObject.output = options.output
  if (configObject.days === undefined) configObject.days = options.days
  if (configObject.delay === undefined) configObject.delay = options.delay
  if (configObject.curl === undefined) configObject.curl = options.curl
  if (configObject.debug === undefined) configObject.debug = options.debug
  if (configObject.gzip === undefined) configObject.gzip = options.gzip
  if (configObject.maxConnections === undefined)
    configObject.maxConnections = options.maxConnections
  if (configObject.request.timeout === undefined) configObject.request.timeout = options.timeout
  if (options.cacheTtl !== undefined) configObject.request.cache = { ttl: options.cacheTtl }

  if (options.proxy !== undefined) {
    const proxy = parseProxy(options.proxy)

    if (
      proxy.protocol &&
      ['socks', 'socks5', 'socks5h', 'socks4', 'socks4a'].includes(String(proxy.protocol))
    ) {
      const socksProxyAgent = new SocksProxyAgent(options.proxy)

      configObject.request = {
        ...configObject.request,
        ...{ httpAgent: socksProxyAgent, httpsAgent: socksProxyAgent }
      }
    } else {
      configObject.request = { ...configObject.request, ...{ proxy } }
    }
  }

  const grabber = new EPGGrabber(configObject, { logger })

  logger.info('Loading channels...')
  const channels = await grabber.loadChannels()
  const template = new Template(configObject.output)
  const variables = template.variables()

  if (!channels.length) {
    logger.info('No channels found')
    logger.info('Exit')

    return
  }

  const groups: Dictionary<Channel[]> = new Collection(channels).groupBy((channel: Channel) => {
    let groupId = ''
    for (const key in channel) {
      if (variables.includes(key)) {
        const obj = channel.toObject() as Record<string, any>
        groupId += obj[key]
      }
    }

    return groupId
  })

  logger.info('Processing...')
  for (let groupId of groups.keys()) {
    const group = groups.get(groupId)
    const groupChannels = new Collection<Channel>(group)
    let programs = new Collection<Program>()
    let index = 1
    let days = configObject.days
    const maxConnections = configObject.maxConnections
    const total = groupChannels.count() * days
    const utcDate = getUTCDate(process.env.CURR_DATE)
    const dates = Array.from({ length: days }, (_, i) => utcDate.add(i, 'd'))

    let queue = new Collection<QueueItem>()
    groupChannels.forEach((channel: Channel) => {
      for (let date of dates) {
        queue.add({ channel, date })
      }
    })

    const taskQueue = new TaskQueue(Promise, maxConnections)
    const requests = queue.map(
      taskQueue.wrap(async (queueItem: QueueItem) => {
        const { channel, date } = queueItem

        if (!channel.logo && configObject.logo) {
          channel.logo = await grabber.loadLogo(channel, date)
        }

        const _programs = await grabber.grab(channel, date, (context, error) => {
          const { channel, date, programs } = context

          logger.info(
            `[${index}/${total}] ${configObject.site} - ${
              channel.xmltv_id || channel.site_id
            } - ${date.format('MMM D, YYYY')} (${programs.length} programs)`
          )

          if (error) logger.error(error.message)

          if (index < total) index++
        })

        programs.concat(new Collection<Program>(_programs))
      })
    )

    await Promise.all(requests.all())

    programs = programs.uniqBy((program: Program) => program.start + program.channel)

    const xml = EPGGrabber.generateXMLTV(groupChannels.all(), programs.all(), utcDate)
    const channelSample = groupChannels.sample()
    let outputPath = template.format(channelSample.toObject() as { [key: string]: any })
    const outputDir = path.dirname(outputPath)

    fs.mkdirSync(outputDir, { recursive: true })

    if (options.gzip) {
      const compressed = pako.gzip(xml)
      outputPath = outputPath || 'guide.xml.gz'
      fs.writeFileSync(outputPath, compressed)
    } else {
      outputPath = outputPath || 'guide.xml'
      fs.writeFileSync(outputPath, xml)
    }

    logger.info(`File '${outputPath}' successfully saved`)
  }

  logger.info('Finished')
}

main()
