import { ChannelsParser } from '../../src/core/channelsParser'
import { Channel } from '../../src/models/channel'
import { it, expect, describe } from 'vitest'
import path from 'path'
import fs from 'fs'

describe('ChannelsParser', () => {
  describe('parse()', () => {
    it('can parse channels.xml', () => {
      const file = fs.readFileSync(
        path.resolve(__dirname, '../__data__/input/example.channels.xml'),
        {
          encoding: 'utf-8'
        }
      )
      const channels = ChannelsParser.parse(file)

      expect(channels.length).toBe(2)
      expect(channels[0]).toBeInstanceOf(Channel)
      expect(channels[1]).toBeInstanceOf(Channel)
      expect(channels[0].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.com',
        lang: 'fr',
        logo: 'https://example.com/logos/1TV.png',
        name: '1 TV',
        index: 0,
        lcn: '36'
      })
      expect(channels[1].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '2',
        lang: null,
        logo: null,
        xmltv_id: '2TV.com',
        name: '2 TV',
        index: 1
      })
    })

    it('can parse channels.xml with inline site attribute', () => {
      const file = fs.readFileSync(
        path.resolve(__dirname, '../__data__/input/example_3.channels.xml'),
        {
          encoding: 'utf-8'
        }
      )
      const channels = ChannelsParser.parse(file)

      expect(channels.length).toBe(2)
      expect(channels[0]).toBeInstanceOf(Channel)
      expect(channels[1]).toBeInstanceOf(Channel)
      expect(channels[0].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.com',
        lang: 'fr',
        logo: 'https://example.com/logos/1TV.png',
        name: '1 TV'
      })
      expect(channels[1].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '2',
        lang: null,
        logo: null,
        xmltv_id: '2TV.com',
        name: '2 TV'
      })
    })

    it('can parse legacy channels.xml', () => {
      const file = fs.readFileSync(
        path.resolve(__dirname, '../__data__/input/legacy.channels.xml'),
        {
          encoding: 'utf-8'
        }
      )
      const channels = ChannelsParser.parse(file)

      expect(channels.length).toBe(2)
      expect(channels[0]).toBeInstanceOf(Channel)
      expect(channels[1]).toBeInstanceOf(Channel)
      expect(channels[0].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '1',
        xmltv_id: '1TV.com',
        lang: 'fr',
        logo: 'https://example.com/logos/1TV.png',
        name: '1 TV'
      })
      expect(channels[1].toObject()).toMatchObject({
        site: 'example.com',
        site_id: '2',
        lang: null,
        logo: null,
        xmltv_id: '2TV.com',
        name: '2 TV'
      })
    })
  })
})
