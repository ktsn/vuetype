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
  it('should output d.ts for class component in sfc', done => {
    generate([resolve('fixtures/ts-class.vue')], err => {
      assert.ifError(err)
      test('fixtures/ts-class.vue.d.ts', 'expects/ts-class.vue.d.ts')
      done()
    })
  })

  it('should output d.ts for component options in sfc', done => {
    generate([resolve('fixtures/ts-object.vue')], err => {
      assert.ifError(err)
      test('fixtures/ts-object.vue.d.ts', 'expects/ts-object.vue.d.ts')
      done()
    })
  })

  it('should not output d.ts for js', done => {
    generate([resolve('fixtures/js.vue')], err => {
      assert.ifError(err)
      notExists('fixtures/js.vue.d.ts')
      done()
    })
  })

  it('should not output d.ts for normal ts', done => {
    generate([resolve('fixtures/not-vue.ts')], err => {
      assert.ifError(err)
      notExists('fixtures/not-vue.d.ts')
      done()
    })
  })
})

function normalize (str: string): string {
  return str.trim().replace(/\r\n/g, '\n')
}