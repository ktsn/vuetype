import assert = require('power-assert')
import path = require('path')
import fs = require('fs')
import rimraf = require('rimraf')
import chokidar = require('chokidar')
import { watch } from '../../src/lib/watch'

const p = (_path: string) => path.resolve(__dirname, '../.tmp', _path)

describe('watch', () => {
  let watcher: chokidar.FSWatcher

  beforeEach(done => {
    fs.mkdir(p('./'), () => {
      watcher = watch([p('./')]).on('ready', done)
    })
  })

  afterEach(done => {
    watcher.close()
    rimraf(p('./'), done)
  })

  it('generates d.ts if .vue file is added', done => {
    watcher.on('add', once(() => {
      assert.ok(fs.existsSync(p('test.vue.d.ts')))
      done()
    }))

    fs.writeFileSync(p('test.vue'), vue('export const test: string = ""'))
  })

  it('updates d.ts if .vue file is updated', done => {
    watcher.on('change', once(() => {
      test(p('test.vue.d.ts'), 'export declare const foo: number;')
      done()
    }))

    fs.writeFileSync(p('test.vue'), vue('export const test: string = ""'))
    fs.writeFileSync(p('test.vue'), vue('export const foo: number = 1'))
  })

  it('removes d.ts if corresponding .vue file is removed', done => {
    watcher.on('add', once(() => {
      assert.ok(fs.existsSync(p('test.vue.d.ts')))
      fs.unlinkSync(p('test.vue'))
    }))

    watcher.on('unlink', once(() => {
      assert.ifError(fs.existsSync(p('test.vue.d.ts')))
      done()
    }))

    fs.writeFileSync(p('test.vue'), vue('export const test: string = ""'))
  })

  it('allows re-add .vue file', done => {
    fs.writeFileSync(p('test.vue'), vue('export declare let a: string'))
    fs.unlinkSync(p('test.vue'))

    watcher.on('add', once(() => {
      test(p('test.vue.d.ts'), 'export declare let b: boolean;')
      done()
    }, true))

    fs.writeFileSync(p('test.vue'), vue('export declare let b: boolean'))
  })
})

// fs.writeFile emits `add` event with empty file data
// so we need to skip first add event in testing
function once (fn: () => void, ignoreFirst: boolean = false): () => void {
  let done = false
  return () => {
    if (ignoreFirst) {
      ignoreFirst = false
      return
    }
    if (done) return
    fn()
    done = true
  }
}

function test (file: string, expected: string) {
  const data = fs.readFileSync(file, 'utf8')
  assert.equal(
    data.trim(),
    expected.trim()
  )
}

function vue (code: string): string {
  return '<script lang="ts">' + code + '</script>'
}
