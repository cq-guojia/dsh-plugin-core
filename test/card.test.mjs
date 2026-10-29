import test from 'node:test'
import assert from 'node:assert/strict'
import { CARD_ACCENTS } from '../dist/ui/index.js'
import { setLocale, t } from '../dist/utils/index.js'

test('色条档位是 13 个，且都有对应文案/语义', () => {
  assert.deepEqual(
    [...CARD_ACCENTS],
    ['business', 'success', 'warning', 'danger', 'neutral',
      'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate'],
  )
})

test('卡片折叠按钮的 aria 文案中英齐全', () => {
  setLocale('zh')
  assert.equal(t('cardToggle'), '展开/收起')
  setLocale('en')
  assert.equal(t('cardToggle'), 'Expand/Collapse')
  setLocale('zh')
})
