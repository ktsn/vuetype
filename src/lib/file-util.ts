import assert = require('assert')
import path = require('path')
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

export function unlink (filePath: string): Promise<never> {
  return exec(fs.unlink, filePath)
}

export function exists (filePath: string): boolean {
  return fs.existsSync(filePath)
}

export function globSync (patterns: string | string[]): string[] {
  if (typeof patterns === 'string') {
    patterns = [patterns]
  }

  return patterns.reduce((acc, pattern) => {
    return acc.concat(glob.sync(pattern))
  }, [] as string[])
}

export function deepestSharedRoot (pathNames: string[]): string {
  assert(pathNames.length >= 1)

  let root: string[] = pathNames[0].split(path.sep)
  pathNames.slice(1).forEach(pathName => {
    const dirs = pathName.split(path.sep)
    dirs.forEach((dir, i) => {
      if (root[i] !== dir) {
        root = root.slice(0, i)
      }
    })
  })
  return root.join(path.sep)
}


function exec (fn: Function, ...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    fn.apply(undefined, args.concat((err: any, res: any) => {
      if (err) reject(err)
      resolve(res)
    }))
  })
}