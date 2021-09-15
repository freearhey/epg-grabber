#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const utils = require('./utils')
const { name, version, description } = require('../package.json')

program
  .name(name)
  .version(version, '-v, --version')
  .description(description)
  .option('-c, --config <config>', 'Path to [site].config.js file')
  .option('-o, --output <output>', 'Path to output file', 'guide.xml')
  .option('--channels <channels>', 'Path to channels.xml file')
  .option('--lang <lang>', 'Set default language for all programs', 'en')
  .option('--days <days>', 'Number of days for which to grab the program', 1)
  .option('--delay <delay>', 'Delay between requests (in mileseconds)', 3000)
  .option('--debug', 'Enable debug mode', false)
  .parse(process.argv)

const options = program.opts()
const config = utils.loadConfig(options)

async function main() {
  console.log('\r\nStarting...')

  const channels = utils.parseChannels(config.channels)
  const utcDate = utils.getUTCDate()
  const dates = Array.from({ length: config.days }, (_, i) => utcDate.add(i, 'd'))

  const queue = []
  channels.forEach(channel => {
    dates.forEach(date => {
      queue.push({ date, channel })
    })
  })

  let programs = []
  console.log('Parsing:')
  for (let item of queue) {
    if (options.debug) console.time('    Response Time')
    await utils
      .buildRequest(item, config)
      .then(utils.fetchData)
      .then(async response => {
        if (options.debug) console.timeEnd('    Response Time')
        if (options.debug) console.time('    Parsing Time')
        const results = await utils.parseResponse(item, response, config)
        if (options.debug) console.timeEnd('    Parsing Time')
        programs = programs.concat(results)
      })
      .then(utils.sleep(config.delay))
      .catch(err => {
        console.log(
          `  ${config.site} - ${item.channel.xmltv_id} - ${item.date.format(
            'MMM D, YYYY'
          )} (0 programs)`
        )
        console.log(`    Error: ${err.message}`)
        if (options.debug) {
          console.timeEnd('    Response Time')
          console.timeEnd('    Parsing Time')
        }
      })
  }

  const xml = utils.convertToXMLTV({ config, channels, programs })
  utils.writeToFile(config.output, xml)

  console.log(`File '${config.output}' successfully saved`)
  console.log('Finish')
}

main()
