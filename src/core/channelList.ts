import { ChannelListLoadProps, ChannelListProps } from '../types/channelList'
import { Collection, Dictionary, Template } from '@freearhey/core'
import { ChannelsParser } from './channelsParser'
import { getAbsPath } from '../utils'
import { Channel } from '../models'
import path from 'node:path'
import { glob } from 'glob'
import fs from 'fs-extra'

export class ChannelList {
  #channels: Collection<Channel>

  constructor({ channels }: ChannelListProps) {
    this.#channels = channels
  }

  static async load({ siteConfig }: ChannelListLoadProps): Promise<ChannelList> {
    const parsedChannels = new Collection<Channel>()
    if (siteConfig.channels) {
      let files = []

      const rootDir = path.dirname(siteConfig.filepath)
      if (Array.isArray(siteConfig.channels)) {
        files = siteConfig.channels.map((channelsPath: string) => getAbsPath(channelsPath, rootDir))
      } else if (typeof siteConfig.channels === 'string') {
        const absPath = getAbsPath(siteConfig.channels, rootDir)
        files = await glob(absPath)
      } else {
        throw new Error('The "channels" attribute must be of type array or string')
      }

      for (const filepath of files) {
        const channelsXML = fs.readFileSync(filepath, 'utf8')
        const channels = ChannelsParser.parse(channelsXML)
        parsedChannels.concat(new Collection<Channel>(channels))
      }
    } else throw new Error('Path to "channels" is missing')

    return new ChannelList({ channels: parsedChannels })
  }

  getChannels(): Collection<Channel> {
    return this.#channels
  }

  getGroups({ template }: { template: Template }): Dictionary<Channel[]> {
    const variables = template.variables()

    return this.#channels.groupBy(channel => {
      let groupId = ''
      for (const key in channel) {
        if (variables.includes(key)) {
          groupId += channel[key]
        }
      }

      return groupId
    })
  }
}
