#!/usr/bin/env node

import program = require('commander')
import async = require('async')
import glob = require('glob')
import { generate } from '../lib/generate'

// tslint:disable-next-line
const meta = require('../../package.json')

program
  .version(meta.version)
  .usage('<files pattern ...>')
  .parse(process.argv)

async.concat(program.args, glob, (err, files: string[]) => {
  if (err) throw err
  generate(files, err => {
    if (err) throw err
  })
})
