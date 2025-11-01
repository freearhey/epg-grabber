#! /usr/bin/env node

import { parseNumber, getUTCDate, loadJs, parseProxy, isObject, getAbsPath } from './core/utils'
import { Collection, Dictionary, Template } from '@freearhey/core'
import { name, version, description } from '../package.json'
import { CurlBody } from 'curl-generator/dist/bodies/body'
import { Command, OptionValues, Option } from 'commander'
import { EPGGrabber, EPGGrabberMock } from './index'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { CurlGenerator } from 'curl-generator'
import defaultConfig from './default.config'
import { Program, Channel } from './models'
import { Logger } from './core/logger'
import { SiteConfig } from './types'
import { AxiosHeaders } from 'axios'
import { TaskQueue } from 'cwait'
import merge from 'lodash.merge'
import Promise from 'bluebird'
import { Dayjs } from 'dayjs'
import path from 'node:path'
import { glob } from 'glob'
import fs from 'fs-extra'
import pako from 'pako'

const program = new Command()

interface QueueItem {
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
  .addOption(new Option('-o, --output <output>', 'Path to output file'))
  .addOption(new Option('-x, --proxy <url>', 'Use the specified proxy'))
  .addOption(new Option('--channels <channels>', 'Path to list of channels'))
  .addOption(
    new Option('--days <days>', 'Number of days for which to grab the program').argParser(
      parseNumber
    )
  )
  .addOption(
    new Option('--delay <delay>', 'Delay between requests (in milliseconds)').argParser(parseNumber)
  )
  .addOption(
    new Option('--timeout <timeout>', 'Set a timeout for each request (in milliseconds)').argParser(
      parseNumber
    )
  )
  .addOption(
    new Option(
      '--max-connections <maxConnections>',
      'Set a limit on the number of concurrent requests per site'
    ).argParser(parseNumber)
  )
  .addOption(
    new Option(
      '--cache-ttl <cacheTtl>',
      'Maximum time for storing each request (in milliseconds)'
    ).argParser(parseNumber)
  )
  .addOption(new Option('--gzip', 'Compress the output'))
  .addOption(new Option('--debug', 'Enable debug mode'))
  .addOption(new Option('--curl', 'Display request as CURL'))
  .addOption(new Option('--log <log>', 'Path to log file'))
  .addOption(new Option('--log-level <level>', 'Set log level'))
  .parse(process.argv)

const options: OptionValues = program.opts()
const logger = new Logger({
  log: options.log,
  logLevel: options.debug === true ? 'debug' : options.logLevel
})

async function main() {
  logger.info('Starting...')

  logger.info(`Loading '${options.config}'...`)
  let config: SiteConfig = await loadJs(options.config)

  config.channels = Array.isArray(config.channels)
    ? config.channels
    : typeof config.channels === 'string'
    ? [config.channels]
    : []

  if (typeof options.cacheTtl === 'number')
    config = merge(config, { request: { cache: { ttl: options.cacheTtl } } })
  if (typeof options.timeout === 'number')
    config = merge(config, { request: { timeout: options.timeout } })
  if (options.proxy !== undefined) {
    const proxy = parseProxy(options.proxy)
    if (
      proxy.protocol &&
      ['socks', 'socks5', 'socks5h', 'socks4', 'socks4a'].includes(String(proxy.protocol))
    ) {
      const socksProxyAgent = new SocksProxyAgent(options.proxy)
      config = merge(config, {
        request: { httpAgent: socksProxyAgent, httpsAgent: socksProxyAgent }
      })
    } else {
      config = merge(config, { request: { proxy } })
    }
  }

  if (typeof options.channels === 'string') config.channels = await glob(options.channels)
  if (typeof options.output === 'string') config.output = options.output
  if (typeof options.days === 'number') config.days = options.days
  if (typeof options.delay === 'number') config.delay = options.delay
  if (typeof options.maxConnections === 'number') config.maxConnections = options.maxConnections
  if (typeof options.debug === 'boolean') config.debug = options.debug
  if (typeof options.curl === 'boolean') config.curl = options.curl
  if (typeof options.gzip === 'boolean') config.gzip = options.gzip

  logger.debug(`Config: ${JSON.stringify(config, null, 2)}`)

  const grabber =
    process.env.NODE_ENV === 'test' ? new EPGGrabberMock(config) : new EPGGrabber(config)

  grabber.client.instance.interceptors.request.use(
    request => {
      logger.debug(`Request: ${JSON.stringify(request, null, 2)}`)

      const curl = config.curl || defaultConfig.curl
      if (curl) {
        type AllowedMethods =
          | 'GET'
          | 'get'
          | 'POST'
          | 'post'
          | 'PUT'
          | 'put'
          | 'PATCH'
          | 'patch'
          | 'DELETE'
          | 'delete'

        const url = request.url || ''
        const method = request.method ? (request.method as AllowedMethods) : 'GET'
        const headers = request.headers
          ? (request.headers.toJSON() as Record<string, string>)
          : undefined
        const body = request.data ? (request.data as CurlBody) : undefined

        const curl = CurlGenerator({ url, method, headers, body })

        logger.info(curl)
      }

      return request
    },
    error => Promise.reject(error)
  )

  grabber.client.instance.interceptors.response.use(
    response => {
      const data = response.data
        ? isObject(response.data) || Array.isArray(response.data)
          ? JSON.stringify(response.data)
          : response.data.toString()
        : undefined

      logger.debug(
        `Response: ${JSON.stringify(
          {
            headers: response.headers,
            data,
            cached: response.cached
          },
          null,
          2
        )}`
      )

      return response
    },
    error => Promise.reject(error)
  )

  if (!Array.isArray(config.channels) || !config.channels.length)
    throw new Error('Path to "*.channels.xml" is missing')

  const channels = new Collection<Channel>()
  const rootDir = options.channels ? process.cwd() : path.dirname(options.config)
  config.channels.forEach((filepath: string) => {
    const absFilepath = getAbsPath(filepath, rootDir)

    logger.debug(`Loading "${absFilepath}"...`)

    const channelsXML = fs.readFileSync(absFilepath, 'utf8')
    const channelsFromXML = EPGGrabber.parseChannelsXML(channelsXML)
    channels.concat(new Collection(channelsFromXML))
  })

  if (channels.isEmpty()) throw new Error('No channels found')

  const days = config.days || defaultConfig.days
  const maxConnections = config.maxConnections || defaultConfig.maxConnections
  const gzip = config.gzip || defaultConfig.gzip
  const defaultOutput = gzip ? defaultConfig.output + '.gz' : defaultConfig.output
  const output = config.output || defaultOutput
  const template = new Template(output)
  const variables = template.variables()
  const groups: Dictionary<Channel[]> = channels.groupBy((channel: Channel) => {
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
  for (const groupId of groups.keys()) {
    const group = groups.get(groupId)
    const groupChannels = new Collection<Channel>(group)
    let programs = new Collection<Program>()
    let index = 1

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

        if (!channel.logo) {
          channel.logo = await grabber.loadLogo(channel, date)
        }

        const _programs = await grabber.grab(channel, date, (context, error) => {
          const { channel, date, programs } = context

          logger.info(
            `[${index}/${total}] ${channel.site} - ${
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

    const xml = EPGGrabber.generateXMLTV(groupChannels.all(), programs.all(), utcDate)
    const channelSample = groupChannels.sample()
    let outputPath = template.format(channelSample.toObject() as { [key: string]: any })
    const outputDir = path.dirname(outputPath)

    fs.mkdirSync(outputDir, { recursive: true })

    if (gzip) {
      const compressed = pako.gzip(xml)
      fs.writeFileSync(outputPath, compressed)
    } else {
      fs.writeFileSync(outputPath, xml)
    }

    logger.info(`File '${outputPath}' successfully saved`)
  }

  logger.info('Finished')
}

main()
