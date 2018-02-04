import path = require('path')
import fs = require('fs')
import assert = require('power-assert')
import ts = require('typescript')
import { generate } from '../../src/lib/generate'

const testDir = path.resolve(__dirname, '..')
const fixtures = (...parts: string[]) => path.join(testDir, 'fixtures', ...parts)
const expects = (...parts: string[]) => path.join(testDir, 'expects', ...parts)

const compilerOptions: ts.CompilerOptions = {
  experimentalDecorators: true
}

function gen(fileName: string, options: ts.CompilerOptions): Promise<void> {
  return generate([fileName], options)
}

function test(a: string, b: string) {
  const aStr = normalize(fs.readFileSync(a, 'utf8'))
  const bStr = normalize(fs.readFileSync(b, 'utf8'))
  assert.equal(aStr, bStr)
}

function notExists(fileName: string) {
  assert.ok(!fs.existsSync(fileName))
}

describe('generate', () => {
  it('should emit d.ts for class component in sfc', () => {
    return gen(fixtures('ts-class.vue'), compilerOptions).then(() => {
      test(fixtures('ts-class.vue.d.ts'), expects('ts-class.vue.d.ts'))
    })
  })

  it('should emit d.ts for component options in sfc', () => {
    return gen(fixtures('ts-object.vue'), {}).then(() => {
      test(fixtures('ts-object.vue.d.ts'), expects('ts-object.vue.d.ts'))
    })
  })

  it('should not emit d.ts for js', () => {
    return gen(fixtures('js.vue'), {}).then(() => {
      notExists(fixtures('js.vue.d.ts'))
    })
  })

  it('should not emit d.ts for normal ts', () => {
    return gen(fixtures('not-vue.ts'), {}).then(() => {
      notExists(fixtures('not-vue.d.ts'))
    })
  })

  it('should not emit d.ts if there are errors', () => {
    return gen(fixtures('ts-error.vue'), compilerOptions).then(() => {
      notExists(fixtures('ts-error.vue.d.ts'))
    })
  })

  it('should emit d.ts with imported ts types', () => {
    return gen(fixtures('import.vue'), compilerOptions).then(() => {
      test(fixtures('import.vue.d.ts'), expects('import.vue.d.ts'))
    })
  })

  it('should emit d.ts of ts file referred via src attribute', () => {
    return gen(fixtures('src.vue'), compilerOptions).then(() => {
      test(fixtures('src.vue.d.ts'), expects('src.vue.d.ts'))
    })
  })

  it('should be able to import other vue files', () => {
    return gen(fixtures('import-other.vue'), compilerOptions).then(() => {
      test(fixtures('import-other.vue.d.ts'), expects('import-other.vue.d.ts'))
    })
  })
})

function normalize (str: string): string {
  return str.trim().replace(/\r\n/g, '\n')
}
