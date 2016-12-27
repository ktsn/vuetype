import path = require('path')
import fs = require('fs')
import assert = require('power-assert')
import { generate } from '../src/lib/generate'

const resolve = (_path: string) => path.resolve(__dirname, _path)

function test(a: string, b: string) {
  const aStr = normalize(fs.readFileSync(resolve(a), 'utf8'))
  const bStr = normalize(fs.readFileSync(resolve(b), 'utf8'))
  assert.equal(aStr, bStr)
}

function notExists(file: string) {
  assert.ok(!fs.existsSync(resolve(file)))
}

describe('generate', () => {
  it('should emit d.ts for class component in sfc', () => {
    return generate([resolve('fixtures/ts-class.vue')]).then(() => {
      test('fixtures/ts-class.vue.d.ts', 'expects/ts-class.vue.d.ts')
    })
  })

  it('should emit d.ts for component options in sfc', () => {
    return generate([resolve('fixtures/ts-object.vue')]).then(() => {
      test('fixtures/ts-object.vue.d.ts', 'expects/ts-object.vue.d.ts')
    })
  })

  it('should not emit d.ts for js', () => {
    return generate([resolve('fixtures/js.vue')]).then(() => {
      notExists('fixtures/js.vue.d.ts')
    })
  })

  it('should not emit d.ts for normal ts', () => {
    return generate([resolve('fixtures/not-vue.ts')]).then(() => {
      notExists('fixtures/not-vue.d.ts')
    })
  })
})

function normalize (str: string): string {
  return str.trim().replace(/\r\n/g, '\n')
}