import { SiteConfigParser } from '../types/siteConfig'
import { Program } from '../models/program'
import { isPromise } from '../utils'

export class ProgramsParser {
  static async parse(context: SiteConfigParser.Context): Promise<Program[]> {
    const { config, channel } = context

    if (!config || !config.parser) {
      throw new Error('Could not find parser() in the config file')
    }

    let programs = config.parser(context)

    if (isPromise(programs)) {
      programs = await programs
    }

    if (!Array.isArray(programs)) {
      throw new Error('Parser should return an array')
    }

    return programs
      .filter(Boolean)
      .map((data: SiteConfigParser.Data) => Program.fromParserData(data, channel))
  }
}
