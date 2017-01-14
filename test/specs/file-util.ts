import assert = require('power-assert')
import { deepestSharedRoot } from '../../src/lib/file-util'

describe('file-util', () => {
  it('detects deepest shared root', () => {
    const actual = deepestSharedRoot([
      'foo/bar/baz',
      'foo/bar/foo',
      'foo/bar/baz'
    ])

    assert(actual === 'foo/bar')
  })
})
