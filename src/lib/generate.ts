import 'colors'

import path = require('path')
import ts = require('typescript')
import { LanguageService } from './language-service'
import { writeFile } from './file-util'
import { logEmitted, logError } from './logger'

export function generate (filenames: string[], options: ts.CompilerOptions): Promise<never> {
  const vueFiles = filenames
    .filter(file => /\.vue$/.test(file))
    .map(file => path.resolve(file))

  // Should not emit if some errors are occurred
  const service = new LanguageService(vueFiles, {
    ...options,
    declaration: true,
    noEmitOnError: true
  })

  return Promise.all(
    vueFiles.map(file => {
      const dts = service.getDts(file)
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
