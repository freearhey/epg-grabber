import { createXMLElement, getUTCDate, formatDate, isDate } from '../utils'
import { Channel } from '../models/channel'
import { Program } from '../models/program'
import { Dayjs } from 'dayjs'

export class XMLTVGenerator {
  static generate(channels: Channel[], programs: Program[], date: Dayjs = getUTCDate()) {
    if (!channels.every((channel: Channel) => channel instanceof Channel)) {
      throw new Error('"channels" must be an array of Channels')
    }

    if (!programs.every((program: Program) => program instanceof Program)) {
      throw new Error('"programs" must be an array of Programs')
    }

    if (!isDate(date)) {
      throw new Error('"date" must be a valid date')
    }

    let output = `<?xml version="1.0" encoding="UTF-8" ?>`
    output += createXMLElement('tv', { date: formatDate(date, 'YYYYMMDD') }, [
      ...channels.map((channel: Channel) => '\r\n' + channel.toXML()),
      ...programs.map((program: Program) => '\r\n' + program.toXML()),
      '\r\n'
    ])

    return output
  }
}
