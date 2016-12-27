import fs = require('fs')
import glob = require('glob')

export function readFileSync (filePath: string): string | undefined {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    return undefined
  }
}

export function readFile (filePath: string): Promise<string> {
  return exec(fs.readFile, filePath, 'utf8')
}

export function writeFile (filePath: string, data: string): Promise<never> {
  return exec(fs.writeFile, filePath, data)
}

export function globSync (patterns: string | string[]): string[] {
  if (typeof patterns === 'string') {
    patterns = [patterns]
  }

  return patterns.reduce((acc, pattern) => {
    return acc.concat(glob.sync(pattern))
  }, [] as string[])
}

function exec (fn: Function, ...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    fn.apply(undefined, args.concat((err: any, res: any) => {
      if (err) reject(err)
      resolve(res)
    }))
  })
}