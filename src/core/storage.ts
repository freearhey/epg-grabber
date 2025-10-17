import path from 'node:path'

export class Storage {
  static async loadJs(filepath: string) {
    const absPath = path.resolve(filepath)

    return (await import(absPath)).default
  }
}
