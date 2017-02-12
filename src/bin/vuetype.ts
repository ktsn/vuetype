#!/usr/bin/env node

import assert = require('assert')
import path = require('path')
import program = require('commander')
import { globSync, deepestSharedRoot } from '../lib/file-util'
import { findConfig, readConfig } from '../lib/config'
import { generate } from '../lib/generate'
import { watch } from '../lib/watch'

// tslint:disable-next-line
const meta = require('../../package.json')

program
  .version(meta.version)
  .usage('<directory...>')
  .option('-w, --watch', 'watch file changes')
  .parse(process.argv)

if (program.args.length === 0) {
  program.help()
} else {
  const root = path.resolve(deepestSharedRoot(program.args))
  const configPath = findConfig(root)
  const config = configPath && readConfig(configPath)
  const options = config ? config.options : {}

  if (program['watch']) {
    watch(program.args, options)
  } else {
    const patterns = program.args.map(arg => {
      return path.join(arg, '**/*.vue')
    })
    generate(globSync(patterns), options)
  }
}

