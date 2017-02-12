import * as ts from 'typescript'
import { generate as _generate } from './generate'
import { watch as _watch } from './watch'
import { readConfig } from './config'

export function generate (filenames: string[], configPath: string): Promise<never> {
  const config = readConfig(configPath)
  return _generate(filenames, config ? config.options : {})
}

export function watch (dirs: string[], configPath: string): void {
  const config = readConfig(configPath)
  _watch(dirs, config ? config.options : {})
}
