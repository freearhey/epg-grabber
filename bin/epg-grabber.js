#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const fs = require('fs')
const path = require('path')
const grabber = require('../src/index')
const utils = require('../src/utils')
const { name, version, description } = require('../package.json')
const merge = require('lodash.merge')

program
  .name(name)
  .version(version, '-v, --version')
  .description(description)
  .requiredOption('-c, --config <config>', 'Path to [site].config.js file')
  .option('-o, --output <output>', 'Path to output file')
  .option('--channels <channels>', 'Path to channels.xml file')
  .option('--lang <lang>', 'Set default language for all programs')
  .option('--days <days>', 'Number of days for which to grab the program', parseInteger)
  .option('--delay <delay>', 'Delay between requests (in mileseconds)', parseInteger)
  .option('--debug', 'Enable debug mode', false)
  .parse(process.argv)

const options = program.opts()

async function main() {
  console.log('\r\nStarting...')

  console.log(`Loading '${options.config}'...`)
  let config = require(path.resolve(options.config))
  config = merge(config, options)

  if (options.channels) config.channels = options.channels
  else if (config.channels)
    config.channels = path.join(path.dirname(options.config), config.channels)
  else throw new Error("The required 'channels' property is missing")

  if (!config.channels) throw new Error('Path to [site].channels.xml is missing')
  console.log(`Loading '${config.channels}'...`)
  const channelsXML = fs.readFileSync(path.resolve(config.channels), { encoding: 'utf-8' })
  const parsed = utils.parseChannels(channelsXML)
  const channels = parsed.channels || []

  let programs = []
  for (let channel of channels) {
    await grabber
      .grab(channel, config, (data, err) => {
        console.log(
          `  ${config.site} - ${data.channel.xmltv_id} - ${data.date.format('MMM D, YYYY')} (${
            data.programs.length
          } programs)`
        )

        if (err) {
          console.log(`    Error: ${err.message}`)
        }
      })
      .then(results => {
        programs = programs.concat(results)
      })
  }

  const xml = utils.convertToXMLTV({ config, channels, programs })
  const outputPath = config.output || 'guide.xml'
  utils.writeToFile(outputPath, xml)

  console.log(`File '${outputPath}' successfully saved`)
  console.log('Finish')
}

main()

function parseInteger(val) {
  return val ? parseInt(val) : null
}
