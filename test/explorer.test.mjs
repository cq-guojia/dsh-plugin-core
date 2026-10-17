import test from 'node:test'
import assert from 'node:assert/strict'
import {
  crumbsOf,
  extOf,
  joinPath,
  mimeOf,
  parentOf,
  previewKindOf,
} from '../dist/explorer/index.js'

test('crumbsOf / parentOf / joinPath', () => {
  assert.deepEqual(crumbsOf(''), [])
  assert.deepEqual(crumbsOf('a/b/c'), ['a', 'b', 'c'])
  assert.equal(parentOf('a/b/c'), 'a/b')
  assert.equal(parentOf('a'), '')
  assert.equal(joinPath('', 'a'), 'a')
  assert.equal(joinPath('a/b', 'c'), 'a/b/c')
})

test('extOf / mimeOf / previewKindOf', () => {
  assert.equal(extOf('a/b/c.md'), 'md')
  assert.equal(extOf('Makefile'), '')
  assert.equal(mimeOf('x/photo.PNG'), 'image/png')
  assert.equal(mimeOf('x/a.md'), undefined)
  assert.equal(previewKindOf('a.png'), 'image')
  assert.equal(previewKindOf('a.ts'), 'text')
  assert.equal(previewKindOf('a.md'), 'text')
  // 认不出的二进制不给假预览，明确返回 unsupported
  assert.equal(previewKindOf('a.pdf'), 'unsupported')
  assert.equal(previewKindOf('a.docx'), 'unsupported')
  // 无扩展名按文本处理（源码类文件常无后缀，如 Dockerfile）
  assert.equal(previewKindOf('Dockerfile'), 'text')
})
