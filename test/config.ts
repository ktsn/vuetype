import assert = require('power-assert')
import path = require('path')
import glob = require('glob')
import MemoryFs = require('memory-fs')
import ts = require('typescript')
import { findAndReadConfig } from '../src/lib/config'

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

describe('tsconfig detection', () => {
  beforeEach(clear)

  it('should read tsconfig.json on a directory', () => {
    const config = {
      compilerOptions: {
        experimentalDecorators: true
      }
    }
    mock('/path/to/tsconfig.json', config)

    const data = findAndReadConfig('/path/to', host, exists)
    assert.ok(data)

    const options = data!.options
    assert(options.experimentalDecorators === true)
  })

  it('should read tsconfig.json on the closest ancestor', () => {
    const configA = {
      compilerOptions: { target: 'es5' }
    }
    const configB = {
      compilerOptions: { target: 'es2015' }
    }
    const configC = {
      compilerOptions: { target: 'es2016' }
    }
    mock('/path/to/tsconfig.json', configA)
    mock('/path/to/b/tsconfig.json', configB)
    mock('/path/to/c/tsconfig.json', configC)
    mock('/path/to/b/src/test.ts', {})

    const data = findAndReadConfig('/path/to/b/src', host, exists)
    assert.ok(data)

    const options = data!.options
    assert(options.target === ScriptTarget.ES2015)
  })
})

function readFile (fileName: string): string {
  return fs.readFileSync(fileName, 'utf8')
}

function mock (fileName: string, data: any): void {
  fs.mkdirpSync(fileName.split('/').slice(0, -1).join('/'))
  fs.writeFileSync(fileName, JSON.stringify(data))
}

function clear (): void {
  fs.readdirSync('/').forEach(dir => {
    fs.rmdirSync('/' + dir)
  })
}
