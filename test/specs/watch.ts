import assert = require('power-assert')
import path = require('path')
import fs = require('fs')
import rimraf = require('rimraf')
import chokidar = require('chokidar')
import { watch } from '../../src/lib/watch'

const noop = () => {/* noop */}

const p = (_path: string) => path.resolve(__dirname, '../.tmp', _path)

describe('watch', () => {
  let watcher: chokidar.FSWatcher

  beforeEach(done => {
    fs.mkdir(p('./'), () => {
      watcher = watch([p('./')], {}, true).on('ready', done)
    })
  })

  afterEach(done => {
    watcher.close()
    rimraf(p('./'), done)
  })

  it('generates d.ts if .vue file is added', done => {
    watcher.on('add', once(() => {
      test(p('test.vue.d.ts'), 'export declare const test: string;')
      done()
    }))

    fs.writeFile(p('test.vue'), vue('export const test: string = ""'), noop)
  })

  it('updates d.ts if .vue file is updated', done => {
    watcher.on('add', once(() => {
      test(p('test.vue.d.ts'), 'export declare const test: string;')
      fs.writeFile(p('test.vue'), vue('export const foo: number = 1'), noop)
    }))

    watcher.on('change', once(() => {
      test(p('test.vue.d.ts'), 'export declare const foo: number;')
      done()
    }))

    fs.writeFile(p('test.vue'), vue('export const test: string = ""'), noop)
  })

  it('removes d.ts if corresponding .vue file is removed', done => {
    watcher.on('add', once(() => {
      assert.ok(fs.existsSync(p('test.vue.d.ts')))
      fs.unlink(p('test.vue'), noop)
    }))

    watcher.on('unlink', once(() => {
      assert.ifError(fs.existsSync(p('test.vue.d.ts')))
      done()
    }))

    fs.writeFile(p('test.vue'), vue('export const test: string = ""'), noop)
  })

  it('allows re-add .vue file', done => {
    fs.writeFileSync(p('test.vue'), vue('export declare let a: string'))
    fs.unlinkSync(p('test.vue'))

    watcher.on('add', once(() => {
      test(p('test.vue.d.ts'), 'export declare let b: boolean;')
      done()
    }))

    fs.writeFile(p('test.vue'), vue('export declare let b: boolean'), noop)
  })

  it('watches addition of derived ts file via .vue file', done => {
    fs.writeFileSync(p('test.vue'), vue('', { src: 'test-src.ts' }))

    watcher.on('add', once(() => {
      test(p('test.vue.d.ts'), 'export declare const test: string;')
      done()
    }))

    fs.writeFileSync(p('test-src.ts'), 'export const test: string = ""')
  })

  it('watches changes of derived ts file via .vue file', done => {
    fs.writeFileSync(p('test.vue'), vue('', { src: 'test-src.ts' }))
    fs.writeFileSync(p('test-src.ts'), 'export const a: number = 123')

    watcher.on('add', once(() => {
      fs.writeFile(p('test-src.ts'), 'export const b: string = ""', noop)
    }))

    watcher.on('change', once(() => {
      test(p('test.vue.d.ts'), 'export declare const b: string;')
      done()
    }))
  })
})

function once (fn: () => void): (p: string) => void {
  let done = false
  return path => {
    if (!/\.vue.d.ts$/.test(path)) return
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

function vue (code: string, attrs: Record<string, string> = {}): string {
  const attrsStr = Object.keys(attrs)
    .map(key => {
      return `${key}="${attrs[key]}"`
    })
    .join(' ')

  return '<script lang="ts" ' + attrsStr + '>' + code + '</script>'
}
