import assert = require('power-assert')
import path = require('path')
import glob = require('glob')
import MemoryFs = require('memory-fs')
import ts = require('typescript')
import { findConfig, readConfig } from '../../src/lib/config'

const fs = new MemoryFs()
const ScriptTarget = ts.ScriptTarget
const ModuleKind = ts.ModuleKind

const host: ts.ParseConfigHost = {
  useCaseSensitiveFileNames: false,

  readDirectory (rootDir: string, extensions: string[], excludes: string[], includes: string[]): string[] {
    return fs.readdirSync(rootDir).map(file => path.join(rootDir, file))
  },

  fileExists (path: string): boolean {
    return fs.existsSync(path)
  },

  readFile (path: string): string {
    return fs.readFileSync(path, 'utf8')
  }
}

const exists = (fileName: string) => fs.existsSync(fileName)

const root = path.resolve('/')
const pathTo = (...parts: string[]) => path.join(root, 'path', 'to', ...parts)

describe('tsconfig detection', () => {
  beforeEach(clear)

  it('should find tsconfig.json on a directory', () => {
    const tsconfig = pathTo('tsconfig.json')
    mock(tsconfig, {})

    const pathname = findConfig(pathTo(), exists)
    assert(pathname === tsconfig)
  })

  it('should find tsconfig.json on the closest ancestor', () => {
    mock(pathTo('tsconfig.json'), {})
    mock(pathTo('b', 'tsconfig.json'), {})
    mock(pathTo('c', 'tsconfig.json'), {})
    mock(pathTo('b', 'src', 'test.ts'), {})

    const pathname = findConfig(pathTo('b', 'src'), exists)
    assert(pathname === pathTo('b', 'tsconfig.json'))
  })

  it('returns undefined if config is not found', () => {
    const pathname = findConfig(pathTo('src'), exists)
    assert(pathname === undefined)
  })

  it('read tsconfig.json', () => {
    mock(pathTo('tsconfig.json'), {
      compilerOptions: {
        target: 'es5',
        module: 'es2015',
        moduleResolution: 'node',
        experimentalDecorators: true
      }
    })
    const data = readConfig(pathTo('tsconfig.json'), host)
    assert.ok(data)

    const options = data!.options
    assert(options.target === ts.ScriptTarget.ES5)
    assert(options.module === ts.ModuleKind.ES2015)
    assert(options.moduleResolution === ts.ModuleResolutionKind.NodeJs)
    assert(options.experimentalDecorators === true)
  })

  it('returns undefined if the config file is not found', () => {
    const data = readConfig(pathTo('tsconfig.json'), host)
    assert.ifError(data)
  })
})

function mock (fileName: string, data: any): void {
  fs.mkdirpSync(path.resolve(fileName, '..'))
  fs.writeFileSync(fileName, JSON.stringify(data))
}

function clear (): void {
  if (fs.existsSync(root)) {
    fs.readdirSync(root).forEach(dir => {
      fs.rmdirSync(path.join(root, dir))
    })
  }
}
