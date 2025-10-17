import { SiteConfig } from '../core/siteConfig'
import { Collection } from '@freearhey/core'
import { Channel } from '../models'

export type ChannelListProps = {
  channels: Collection<Channel>
}

export type ChannelListLoadProps = {
  siteConfig: SiteConfig
}
