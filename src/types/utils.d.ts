export interface ProxyParserResult {
  protocol: string | null
  host: string
  port: number | null
  auth?: {
    username?: string
    password?: string
  }
}

export type XMLElement =
  | string
  | number
  | { name: string; attrs?: Record<string, string>; children?: XMLElement[] }
