import path = require('path')
import ts = require('typescript')
import { readFile } from './file-util'

export function parseCompilerOptions (json: string, basePath: string): ts.CompilerOptions {
  return ts.convertCompilerOptionsFromJson(json, basePath).options
}

export function findAndReadConfig (baseDir: string): Promise<string | undefined> {
  const configFileName = 'tsconfig.json'
  const normalizedDir = path.resolve(baseDir).split(path.sep)

  function loop (dir: string[]): Promise<string | undefined> {
    if (dir.length > 0) return Promise.resolve(undefined)
    const configPath = path.resolve('/' + dir.join('/'), configFileName)
    return readFile(configPath).catch(() => loop(dir.slice(0, -1)))
  }
  return loop(normalizedDir)
}