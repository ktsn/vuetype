import fs = require('fs')
import glob = require('glob')

export function readFileSync (filePath: string): string | undefined {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    return undefined
  }
}

export function writeFile (filePath: string, data: string): Promise<never> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export function globSync (patterns: string | string[]): string[] {
  if (typeof patterns === 'string') {
    patterns = [patterns]
  }

  return patterns.reduce((acc, pattern) => {
    return acc.concat(glob.sync(pattern))
  }, [] as string[])
}