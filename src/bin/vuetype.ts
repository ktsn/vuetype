#!/usr/bin/env node

import assert = require('assert')
import path = require('path')
import program = require('commander')
import { globSync, deepestSharedRoot } from '../lib/file-util'
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

  const root = path.resolve(deepestSharedRoot(program.args))
  const config = findAndReadConfig(root)
  const options = config ? config.options : {}
  generate(globSync(patterns), options)
}

