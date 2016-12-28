#!/usr/bin/env node

import assert = require('assert')
import path = require('path')
import program = require('commander')
import { globSync } from '../lib/file-util'
import { findAndReadConfig } from '../lib/config'
import { generate } from '../lib/generate'

// tslint:disable-next-line
const meta = require('../../package.json')

program
  .version(meta.version)
  .usage('<directory...>')
  .parse(process.argv)

if (program.args.length === 0) {
  program.help()
} else {
  const patterns = program.args.map(arg => {
    return path.join(arg, '**/*.vue')
  })

  const root = path.resolve(detectDeepestRoot(program.args))
  const config = findAndReadConfig(root)
  const options = config ? config.options : {}
  generate(globSync(patterns), options)
}

function detectDeepestRoot (pathNames: string[]): string {
  assert(pathNames.length >= 1)

  let root: string[] = pathNames[0].split(path.sep)
  pathNames.slice(1).forEach(pathName => {
    const dirs = pathName.split(path.sep)
    dirs.forEach((dir, i) => {
      if (root[i] !== dir) {
        root = root.slice(0, i)
      }
    })
  })
  return root.join(path.sep)
}
