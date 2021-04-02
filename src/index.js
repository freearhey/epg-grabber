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
  .option('-d, --debug', 'Enable debug mode')
  .parse(process.argv)

async function main() {
  console.log('\r\nStarting...')

  const options = program.opts()
  const config = utils.loadConfig(options.config)
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
    if (options.debug) console.time('    time')
    const progs = await utils
      .fetchData(item, config)
      .then(response => {
        if (!item.channel.logo && config.logo) {
          item.channel.logo = config.logo({
            channel: item.channel,
            content: response.data.toString(),
            buffer: response.data
          })
        }

        const programs = utils.parsePrograms({ response, item, config })
        console.log(
          `  ${config.site} - ${item.channel.xmltv_id} - ${item.date.format('MMM D, YYYY')} (${
            programs.length
          } programs)`
        )
        if (options.debug) console.timeEnd('    time')

        return programs.map(program => {
          program.lang = program.lang || item.channel.lang || undefined
          return program
        })
      })
      .then(utils.sleep(config.delay))
      .catch(err => {
        console.log(
          `  ${config.site} - ${item.channel.xmltv_id} - ${item.date.format(
            'MMM D, YYYY'
          )} (0 programs)`
        )
        console.log(`    Error: ${err.message}`)
      })

    programs = programs.concat(progs)
  }

  const xml = utils.convertToXMLTV({ config, channels, programs })
  utils.writeToFile(config.output, xml)

  console.log(`File '${config.output}' successfully saved`)
  console.log('Finish')
}

main()
