#!/usr/bin/env node

import path = require('path')
import program = require('commander')
import { globSync } from '../lib/file-util'
import { generate } from '../lib/generate'

// tslint:disable-next-line
const meta = require('../../package.json')

program
  .version(meta.version)
  .usage('<directory...>')
  .parse(process.argv)

const patterns = program.args.map(arg => {
  return path.join(arg, '**/*.vue')
})

generate(globSync(patterns))

