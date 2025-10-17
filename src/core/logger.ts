import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'
import { TransformableInfo } from 'logform'
import winston from 'winston'
import path from 'path'

const { combine, timestamp, printf } = winston.format

export type LoggerOptions = {
  logLevel?: string
  log?: string
}

export class Logger {
  #logger: winston.Logger

  constructor(options?: LoggerOptions) {
    options = options || {}

    const fileFormat = printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`
    })

    const templateFunction = (info: TransformableInfo) => {
      if (info.level === 'error') return `  Error: ${info.message}`
      if (typeof info.message === 'string') return info.message
      return ''
    }

    const consoleFormat = printf(templateFunction)

    const transports: (ConsoleTransportInstance | FileTransportInstance)[] = [
      new winston.transports.Console({ format: consoleFormat })
    ]

    if (options.log) {
      transports.push(
        new winston.transports.File({
          filename: path.resolve(options.log),
          format: combine(timestamp(), fileFormat),
          options: { flags: 'w' }
        })
      )
    }

    this.#logger = winston.createLogger({
      level: options.logLevel,
      transports
    })
  }

  info(message: string) {
    this.#logger.info(message)
  }

  debug(message: string) {
    this.#logger.debug(message)
  }

  error(message: string) {
    this.#logger.error(message)
  }
}
