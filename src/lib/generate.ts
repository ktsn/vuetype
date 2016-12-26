import path = require('path')
import fs = require('fs')
import async = require('async')
import vueCompiler = require('vue-template-compiler')
import { LanguageService } from './language-service'

export function generate (filenames: string[], done: (err: Error) => void): void {
  const vueFiles = filenames
    .filter(file => /\.vue$/.test(file))
    .map(file => path.resolve(file))

  const service = new LanguageService({ declaration: true })

  async.map(
    vueFiles,
    (file, done: Function) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) return done(err)

        const script = vueCompiler.parseComponent(data, { pad: true }).script

        if (script == null) return done()
        if (script.lang !== 'ts') return done()

        service.updateSrcScript(file, script.content)

        const dts = service.getDts(file)
        fs.writeFile(file + '.d.ts', dts, err => {
          console.log('output: ' + file + '.d.ts')
          done()
        })
      })
    },
    done
  )
}
