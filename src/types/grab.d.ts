import { Channel, Program } from '../models'
import { Dayjs } from 'dayjs'

export type GrabCallback = (context: GrabCallbackContext, error: Error | null) => void

export interface GrabCallbackContext {
  channel: Channel
  programs: Program[]
  date: Dayjs
}
