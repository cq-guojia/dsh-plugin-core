import { createElement as h, useState } from 'react'
import { Button, Checkbox, IconButton, Input, NumberInput, Segmented, Textarea } from '../../dist/ui/index.js'
import { Demo } from './index.js'

export function ButtonsSection(): ReturnType<typeof h> {
  const [text, setText] = useState('')
  const [num, setNum] = useState(3)
  const [checked, setChecked] = useState(true)
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('week')
  const [multi, setMulti] = useState<string[]>(['mon'])

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
      { title: 'Input 家族', hint: 'Input / PrefixedInput / NumberInput / Textarea，都支持 error 描红' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px' } },
        h(Input, { value: text, onChange: setText, placeholder: '任务名' }),
        h(Input, { value: 'bad value', onChange: () => {}, error: true, placeholder: '校验失败态' }),
        h(NumberInput, { value: num, onChange: setNum, min: 0, max: 10, suffix: '次' }),
        h(Textarea, { value: text, onChange: setText, placeholder: '多行输入' }),
      ),
    ),
    h(
      Demo,
      { title: 'Checkbox / Segmented' },
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
          multiple: true,
          items: [
            { value: 'mon', label: '一' },
            { value: 'tue', label: '二' },
            { value: 'wed', label: '三' },
          ],
          value: multi,
          onChange: setMulti,
        }),
      ),
    ),
  )
}
