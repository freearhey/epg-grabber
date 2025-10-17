import { URL } from 'node:url'

export type ProxyParserResult = {
  protocol: string | null
  host: string
  port: number | null
  auth?: {
    username?: string
    password?: string
  }
}

export class ProxyParser {
  static parse(proxy: string): ProxyParserResult {
    const parsed = new URL(proxy)

    const result: ProxyParserResult = {
      protocol: parsed.protocol.replace(':', '') || null,
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : null
    }

    if (parsed.username || parsed.password) {
      result.auth = {}
      if (parsed.username) result.auth.username = parsed.username
      if (parsed.password) result.auth.password = parsed.password
    }

    return result
  }
}
