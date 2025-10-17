import { SiteConfigParser } from '../../src/types/siteConfig'
import { ProgramsParser } from '../../src/core/programsParser'
import { SiteConfig } from '../../src/core/siteConfig'
import { Channel } from '../../src/models/channel'
import { Program } from '../../src/models/program'
import { it, describe, expect } from 'vitest'
import dayjs from 'dayjs'

const channel = new Channel({
  xmltv_id: '1tv',
  name: '1TV',
  site: 'example.com',
  site_id: '#',
  lang: null,
  logo: null,
  lcn: null,
  url: null,
  index: -1
})

describe('ProgramsParser', () => {
  describe('parse()', () => {
    it('can parse programs', async () => {
      const configObject = (await import('../__data__/input/example.config.cjs')).default
      const siteConfig = new SiteConfig({ ...configObject, filepath: 'example.config.js' })
      const parserContext: SiteConfigParser.Context = {
        config: siteConfig,
        channel,
        cached: false,
        date: dayjs()
      }

      const programs = await ProgramsParser.parse(parserContext)
      expect(programs.length).toBe(1)
      expect(programs[0]).toBeInstanceOf(Program)
    })

    it('can parse programs async', async () => {
      const configObject = (await import('../__data__/input/async.config.cjs')).default
      const siteConfig = new SiteConfig({ ...configObject, filepath: 'example.config.js' })
      const parserContext = { config: siteConfig, channel, cached: false, date: dayjs() }

      const programs = await ProgramsParser.parse(parserContext)
      expect(programs.length).toBe(1)
      expect(programs[0]).toBeInstanceOf(Program)
    })
  })
})
