import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const ROOT = new URL('../', import.meta.url)
const EXTERNAL = [
  'react', 'react-dom', 'react/jsx-runtime',
  '@deepseek-ai/*', 'sonner', 'zustand', 'zustand/*',
  '@floating-ui/*', '@uiw/*', '@codemirror/*', '@lezer/*',
]
const HEAVY = /^(sonner|zustand|@uiw\/|@codemirror\/|@lezer\/|@deepseek-ai\/)/

async function probe(file) {
  const result = await build({
    stdin: {
      contents: `import * as m from './dist/${file}.js'; export default m;`,
      resolveDir: fileURLToPath(ROOT),
      sourcefile: 'probe.ts',
      loader: 'ts',
    },
    bundle: true,
    write: false,
    metafile: true,
    format: 'cjs',
    platform: 'browser',
    external: EXTERNAL,
    logLevel: 'silent',
  })
  const out = result.metafile.outputs[Object.keys(result.metafile.outputs)[0]]
  return {
    inputs: Object.keys(out.inputs),
    imports: out.imports.map((item) => item.path),
  }
}

const PROBES = [
  ['./ui/input', 'ui/inputs/Field'],
  ['./ui/picker', 'ui/inputs/Picker'],
  ['./ui/table', 'ui/display/Table'],
  ['./ui/button', 'ui/actions/Button'],
  ['./ui/modal', 'ui/feedback/Modal'],
  ['./ui/panel-dock', 'ui/layout/PanelDock'],
  ['./ui/dialogs', 'ui/feedback/modal-host'],
  ['./ui/notify', 'ui/feedback/notify'],
  ['./ui/task-notifications', 'ui/infra/task-notifications'],
  ['./ui/code-editor', 'ui/inputs/CodeEditor'],
]

test('单块入口不绕回整包 barrel，产物闭包远小于整包', async () => {
  const whole = await probe('ui/index')
  const wholeCount = whole.inputs.filter((path) => path.startsWith('dist/ui/')).length
  assert.ok(wholeCount > 60, `整包入口应含全部控件，实际只有 ${wholeCount} 个 ui 模块`)
  for (const [sub, file] of PROBES) {
    const { inputs } = await probe(file)
    assert.ok(!inputs.includes('dist/ui/index.js'), `${sub} 绕回了整包入口`)
    const count = inputs.filter((path) => path.startsWith('dist/ui/')).length
    assert.ok(count < wholeCount, `${sub} 带进 ${count} 个 ui 模块，不小于整包 ${wholeCount}`)
  }
})

test('纯控件入口不带重依赖', async () => {
  for (const [sub, file] of PROBES.slice(0, 6)) {
    const { imports } = await probe(file)
    assert.deepEqual(imports.filter((path) => HEAVY.test(path)), [], `${sub} 带进了重依赖`)
  }
})

test('引 Input 不带下拉框，引下拉框不带 Input 控件实现', async () => {
  const input = await probe('ui/inputs/Field')
  assert.ok(!input.inputs.includes('dist/ui/inputs/Picker.js'), 'Input 产物里出现了 Picker.js')
  const picker = await probe('ui/inputs/Picker')
  assert.ok(!picker.inputs.includes('dist/ui/inputs/Field.js'), 'Picker 产物里出现了 Field.js')
})
