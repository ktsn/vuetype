import path = require('path')
import ts = require('typescript')

export function findAndReadConfig (
  baseDir: string,
  _parseConfigHost: ts.ParseConfigHost = ts.sys // for test
): ts.ParsedCommandLine | undefined {
  const configFileName = 'tsconfig.json'

  function loop (dir: string): ts.ParsedCommandLine | undefined {
    const configPath = path.join(dir, configFileName)
    const result = ts.readConfigFile(configPath, _parseConfigHost.readFile)

    if (result.error) {
      const parent = path.dirname(dir)
      if (dir === parent) return undefined

      return loop(parent)
    }

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
