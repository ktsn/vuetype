import path = require('path')
import ts = require('typescript')
import { exists } from './file-util'

export function readConfig (
  configPath: string,
  _parseConfigHost: ts.ParseConfigHost = ts.sys // for test
): ts.ParsedCommandLine | undefined {
  const result = ts.readConfigFile(configPath, _parseConfigHost.readFile)

  if (result.error) {
    return undefined
  }

  return ts.parseJsonConfigFileContent(
    result.config,
    _parseConfigHost,
    path.dirname(configPath),
    undefined,
    configPath
  )
}

export function findConfig (
  baseDir: string,
  _exists: (filePath: string) => boolean = exists // for test
): string | undefined {
  const configFileName = 'tsconfig.json'

  function loop (dir: string): string | undefined {
    const parentPath = path.dirname(dir)
    // It is root directory if parent and current dirname are the same
    if (dir === parentPath) {
      return undefined
    }

    const configPath = path.join(dir, configFileName)
    if (_exists(configPath)) {
      return configPath
    }

    return loop(parentPath)
  }
  return loop(baseDir)
}
