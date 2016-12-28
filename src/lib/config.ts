import path = require('path')
import ts = require('typescript')
import { exists } from './file-util'

export function findAndReadConfig (
  baseDir: string,
  _parseConfigHost: ts.ParseConfigHost = ts.sys, // for test
  _exists: (filePath: string) => boolean = exists // for test
): ts.ParsedCommandLine | undefined {
  const configFileName = 'tsconfig.json'

  function loop (dir: string): ts.ParsedCommandLine | undefined {
    const configPath = path.join(dir, configFileName)
    if (!_exists(configPath)) {
      return loop(dir.slice(0, -1))
    }

    const result = ts.readConfigFile(configPath, _parseConfigHost.readFile)

    return ts.parseJsonConfigFileContent(
      result.config,
      _parseConfigHost,
      dir,
      undefined,
      configPath
    )
  }
  return loop(baseDir)
}
