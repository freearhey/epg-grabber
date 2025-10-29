export type XMLElement =
  | string
  | number
  | { name: string; attrs?: Record<string, string | undefined>; children?: (XMLElement | null)[] }
