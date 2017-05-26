import assert = require('power-assert')
import path = require('path')
import { deepestSharedRoot } from '../../src/lib/file-util'

describe('file-util', () => {
  it('detects deepest shared root', () => {
    const actual = deepestSharedRoot([
      path.join('foo', 'bar', 'baz'),
      path.join('foo', 'bar', 'foo'),
      path.join('foo', 'bar', 'baz')
    ])

    assert(actual === path.join('foo', 'bar'))
  })
})
