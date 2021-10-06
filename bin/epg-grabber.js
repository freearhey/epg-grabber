#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const path = require('path')
const grabber = require('../src/index')
const utils = require('../src/utils')
const { name, version, description } = require('../package.json')

program
  .name(name)
  .version(version, '-v, --version')
  .description(description)
  .requiredOption('-c, --config <config>', 'Path to [site].config.js file')
  .option('-o, --output <output>', 'Path to output file', 'guide.xml')
  .option('--channels <channels>', 'Path to channels.xml file')
  .option('--lang <lang>', 'Set default language for all programs', 'en')
  .option('--days <days>', 'Number of days for which to grab the program', 1)
  .option('--delay <delay>', 'Delay between requests (in mileseconds)', 3000)
  .option('--debug', 'Enable debug mode', false)
  .parse(process.argv)

const options = program.opts()

async function main() {
  console.log('\r\nStarting...')

  console.log(`Loading '${options.config}'...`)
  const config = utils.loadConfig(require(path.resolve(options.config)), options)

  if (options.channels) config.channels = options.channels
  else if (config.channels)
    config.channels = path.join(path.dirname(options.config), config.channels)
  else throw new Error("The required 'channels' property is missing")

  console.log('Parsing:')
  let programs = []
  const channels = utils.parseChannels(config.channels)
  for (let channel of channels) {
    await grabber.grab(channel, config, result => {
      result.on('data', function (data) {
        console.log(
          `  ${config.site} - ${data.channel.xmltv_id} - ${data.date.format('MMM D, YYYY')} (${
            data.programs.length
          } programs)`
        )
      })

      result.on('error', function (err) {
        console.log(`    Error: ${err.message}`)
      })

      result.on('done', function (results) {
        programs = programs.concat(results)
      })
    })
  }

  const xml = utils.convertToXMLTV({ config, channels, programs })
  utils.writeToFile(config.output, xml)

  console.log(`File '${config.output}' successfully saved`)
  console.log('Finish')
}

main()
