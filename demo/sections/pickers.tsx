import { createElement as h, useState } from 'react'
import { FilePicker, ModelPicker, Picker, WorkspacePicker } from '../../dist/ui/index.js'
import { Demo } from './index.js'

const MODELS = [
  {
    value: 'openai',
    label: 'OpenAI',
    options: [
      { value: 'openai/gpt-4', label: 'GPT-4' },
      { value: 'openai/gpt-3', label: 'GPT-3.5' },
    ],
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    options: [{ value: 'anthropic/claude', label: 'Claude' }],
  },
]

export function PickersSection(): ReturnType<typeof h> {
  const [single, setSingle] = useState<string | undefined>(undefined)
  const [multi, setMulti] = useState<string[]>([])
  const [model, setModel] = useState('')
  const [ws, setWs] = useState<string | undefined>(undefined)
  const [file, setFile] = useState<string | undefined>(undefined)

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'Picker', hint: '单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级——全部可用 props 控制' },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' } },
        h(Picker, {
          options: [
            { value: 'a', label: '选项 A' },
            { value: 'b', label: '选项 B' },
            { value: 'c', label: '选项 C' },
          ],
          value: single,
          onChange: (v) => setSingle(v as string),
          searchable: true,
          clearable: true,
          placeholder: '单选（可搜索/可清除）',
        }),
        h(Picker, {
          groups: MODELS,
          value: multi,
          mode: 'multiple',
          max: 2,
          onChange: (v) => setMulti(v as string[]),
          searchable: true,
          placeholder: '多选（上限 2）',
        }),
        h(Picker, {
          options: [{ value: 'x', label: '降级示例' }],
          degraded: true,
          disabled: true,
          placeholder: '降级 + 禁用',
        }),
      ),
    ),
    h(
      Demo,
      { title: 'ModelPicker', hint: 'flat 一个下拉 / cascade 先选供应商再选模型——同一份数据两种形态' },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
        h(ModelPicker, { groups: MODELS, value: model, onChange: setModel, variant: 'flat' }),
        h(ModelPicker, { groups: MODELS, value: model, onChange: setModel, variant: 'cascade' }),
      ),
    ),
    h(
      Demo,
      { title: 'WorkspacePicker / FilePicker', hint: '数据调用方给（要跨 host↔client 边界，组件取不到）' },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
        h(WorkspacePicker, {
          workspaces: ['nas', 'code', 'docs'],
          value: ws,
          onChange: (v) => setWs(v as string),
          clearable: true,
        }),
        h(FilePicker, {
          files: ['README.md', 'package.json', 'src/index.ts'],
          value: file,
          onChange: (v) => setFile(v as string),
          clearable: true,
        }),
      ),
    ),
  )
}
