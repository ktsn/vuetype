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
})

function once (fn: () => void): () => void {
  let done = false
  return () => {
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
