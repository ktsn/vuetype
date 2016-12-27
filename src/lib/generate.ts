import 'colors'

import path = require('path')
import ts = require('typescript')
import { LanguageService } from './language-service'
import { writeFile } from './file-util'

export function generate (filenames: string[], options: ts.CompilerOptions): Promise<never> {
  const vueFiles = filenames
    .filter(file => /\.vue$/.test(file))
    .map(file => path.resolve(file))

  const service = new LanguageService(vueFiles, {
    ...options,
    noEmitOnError: true
  })

  return Promise.all(
    vueFiles.map(file => {
      const dts = service.getDts(file + '.ts')
      const dtsPath = file + '.d.ts'

      if (dts.errors.length > 0) {
        logError(dtsPath, dts.errors)
        return
      }

      if (dts.result === null) return

      return writeFile(dtsPath, dts.result)
        .then(() => {
          logEmitted(dtsPath)
        })
    })
  )
}

function logEmitted (filePath: string): void {
  console.log('Emitted: '.green + filePath)
}

function logError (filePath: string, messages: string[]): void {
  const errors = [
    'Emit Failed: '.red + filePath,
    ...messages.map(m => '  ' + 'Error: '.red + m)
  ]
  console.error(errors.join('\n'))
}