// 版本一致性自检：核心与 demo 插件**必须同一个版本号**，共用同一个 `vX.Y.Z` tag 发布。
//
// 为什么是硬约束：两个包由同一个 tag 触发两个 workflow 同时发；版本走岔了，
// 用户装到的库和 demo 就不是一次构建出来的东西，排查时会互相甩锅。
// CI（publish.yml / demo-publish.yml）另有同样校验，这里是本地最后一道。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))

const core = await readJson('../package.json')
const demo = await readJson('../packages/demo/package.json')

test('demo 插件版本必须与核心完全一致', () => {
  assert.equal(demo.version, core.version, `核心 ${core.version} ≠ demo ${demo.version}`)
})

test('版本号是合法 semver（tag 直接由它派生：v<version>）', () => {
  const semver = /^\d+\.\d+\.\d+$/
  assert.match(core.version, semver)
  assert.match(demo.version, semver)
})

test('包名固定：核心 dsh-plugin-core / demo dsh-plugin-core-demo', () => {
  assert.equal(core.name, 'dsh-plugin-core')
  assert.equal(demo.name, 'dsh-plugin-core-demo')
})
