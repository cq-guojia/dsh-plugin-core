import { createElement as h, useState } from 'react'
import { Button, Checkbox, FieldHint, IconButton, Input, NumberInput, Segmented, Textarea } from '../../dist/ui/index.js'
import { Demo } from './index.js'

export function ButtonsSection(): ReturnType<typeof h> {
  const [text, setText] = useState('')
  const [num, setNum] = useState(3)
  const [checked, setChecked] = useState(true)
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('week')
  const [filter, setFilter] = useState('all')
  const [multi, setMulti] = useState<string[]>(['1'])

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'Button', hint: 'variant 四档 × size 三档' },
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
        (['primary', 'outline', 'ghost', 'danger'] as const).map((v) =>
          h(Button, { key: v, variant: v, onClick: () => {} }, v),
        ),
        h(Button, { size: 'sm' }, 'sm'),
        h(Button, { size: 'lg' }, 'lg'),
        h(IconButton, { icon: '+', label: '新增' }),
      ),
    ),
    h(
      Demo,
      { title: 'Input 家族', hint: 'Input / PrefixedInput / NumberInput / Textarea，都支持 error 描红；行尾可挂 FieldHint 问号提示' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px' } },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          h('span', { style: { color: 'var(--tdt-fg-2)', fontSize: '13px', flex: 'none' } }, '开始时间'),
          h(Input, { value: text, onChange: setText, placeholder: '选择日期' }),
          h(FieldHint, { text: '任务自该日起开始执行。可提前创建任务，至该日自动开跑；「每 N 周」亦自该日起算首周。' }),
        ),
        h(Input, { value: 'bad value', onChange: () => {}, error: true, placeholder: '校验失败态' }),
        h(NumberInput, { value: num, onChange: setNum, min: 0, max: 10, suffix: '次' }),
        h(Textarea, { value: text, onChange: setText, placeholder: '多行输入' }),
      ),
    ),
    h(
      Demo,
      { title: 'Checkbox / Segmented', hint: 'size 三档（sm/md/lg）× variant 两套外观；badge = danger 圆角标，count = 中性计数' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' } },
        h(
          'div',
          { style: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' } },
          h(Checkbox, { checked, onChange: setChecked, label: '启用' }),
          h(Segmented, {
            items: [
              { value: 'day', label: '日' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
            ],
            value: seg,
            onChange: setSeg,
          }),
          h(Segmented, {
            items: [
              { value: 'day', label: '日' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
            ],
            size: 'sm',
            value: seg,
            onChange: setSeg,
          }),
        ),
        // 筛选条形态：中性计数（对齐真实插件「全部 11 / 进行中 …」）
        h(Segmented, {
          items: [
            { value: 'all', label: '全部', count: 11 },
            { value: 'doing', label: '进行中', count: 5 },
            { value: 'claimed', label: '待认领', count: 11 },
            { value: 'blocked', label: '阻塞' },
            { value: 'stalled', label: '停滞' },
          ],
          value: filter,
          onChange: setFilter,
        }),
        // 星期多选方块（蓝底选中、近似方形）
        h(Segmented, {
          multiple: true,
          className: 'dsh-tdt-seg--weekday',
          label: '星期',
          items: [
            { value: '1', label: '一' },
            { value: '2', label: '二' },
            { value: '3', label: '三' },
            { value: '4', label: '四' },
            { value: '5', label: '五' },
            { value: '6', label: '六' },
            { value: '7', label: '日' },
          ],
          value: multi,
          onChange: setMulti,
        }),
      ),
    ),
  )
}
