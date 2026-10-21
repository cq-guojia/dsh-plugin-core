/**
 * 文档骨架积木（Bootstrap 文档站式）：提示框 / 示例+代码双栏 / 用法 / API 表。
 *
 * 只管「页面怎么摆」，不进库 —— 库里没有也不该有「文档站外壳」这种东西。
 * 样式真源在 demo.css（由 scripts/gen-css.mjs 生成本包内的 demo-css.generated.ts）。
 * 代码高亮与复制按钮一律走官方 CodeBlock，不自绘（官方件优先，见 docs/requirements.md）。
 *
 * 文档体（prose / api / code）现在直接吃 packages/demo/src/doc-data.generated.ts ——
 * 那份由 scripts/gen-docs.mjs 从 docs 下的 doc.ts 扁平聚合生成，零解析。
 * 因此「重分类 / 改文档」只动 doc.ts，本层一行不动。
 */
import { createElement as h, Fragment, type ReactNode } from 'react'
import { CodeBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import { StripCard } from '../../../dist/ui/index.js'
import { getLocale } from '../../../dist/utils/index.js'
import { t, type DemoMessageKey } from './i18n.js'
import { docData as RAW_DOC_DATA } from './doc-data.generated.js'

/** 文档真源（生成物）的本地镜像类型 —— 与 docs/design/doc-format.ts 保持同形，这里不引那个文件以免 demo 依赖 docs/。 */
type Bilingual = { zh: string; en: string }
type DocApiRow = { name: string; type: string; def: string; required?: string; desc: Bilingual }
type DocApiTable = { id: string; rows: DocApiRow[] }
type DocCodeBlock = { id: string; lang: string; src: string }
type DocSection = {
  id: string
  heading: Bilingual
  prose?: Bilingual[]
  api?: DocApiTable[]
  code?: DocCodeBlock[]
}
const DOC_DATA = RAW_DOC_DATA as unknown as Record<string, DocSection>

/** 当前语言（核心单一 locale 状态，与 t() 同源）。 */
function locale(): 'zh' | 'en' {
  return getLocale() === 'en' ? 'en' : 'zh'
}

export type ApiRow = {
  name: string
  type: string
  def: string
  required?: string
  /** 走 demo 字典（旧用法，过渡期保留；控件页仍在用）。 */
  descKey?: DemoMessageKey
  /** 直接给文案（来自 docData 的新用法）。 */
  desc?: string
}

/**
 * 页级备注框：直接用核心 StripCard（方角 + 左缘 4px 通高色条 + 同色系浅底，无可见边框），
 * 不自绘 callout —— 演示站里的提示与插件真实用的提示必须是同一个东西。
 * text 与 children 二选一：单行提示走 text（reference/foundation 在用），多段说明走 children（DocProse 在用）。
 */
export function Note(props: { text?: string; children?: ReactNode }): ReturnType<typeof h> {
  return h(
    StripCard,
    { accent: 'business', className: 'dshpc-doc-note' },
    h(
      'div',
      { className: 'dshpc-doc-note__body' },
      h('span', { className: 'dshpc-doc-note__mark' }, t('docNote')),
      props.children ?? h('span', null, props.text ?? ''),
    ),
  )
}

/** 一段代码（用法 / 安装这类没有实时渲染的块）。 */
export function CodeOnly(props: {
  labelKey?: DemoMessageKey
  label?: string
  code: string
  lang?: string
}): ReturnType<typeof h> {
  const label = props.label ?? (props.labelKey !== undefined ? t(props.labelKey) : t('docCode'))
  return h(
    'div',
    { className: 'dshpc-doc-block' },
    h('div', { className: 'dshpc-doc-label' }, label),
    h(CodeBlock, {
      code: props.code,
      lang: props.lang ?? 'tsx',
      showHeader: true,
      copyLabel: t('docCopy'),
      copiedLabel: t('docCopied'),
    }),
  )
}

/**
 * 一个示例 = 左边实时渲染 + 右边可滚动的高亮代码。
 * 两栏用 grid auto-fit：容器窄到放不下两列时自动塌成一列（代码落到示例下方）。
 */
export function Example(props: {
  title: string
  hint?: string
  /** 不传就只渲染左栏（grid 单列时示例自动占满）—— 还在补代码的页先这样挂着。 */
  code?: string
  children?: ReactNode
}): ReturnType<typeof h> {
  return h(
    'section',
    { className: 'dshpc-doc-example' },
    h(
      'div',
      { className: 'dshpc-doc-example__head' },
      h('div', { className: 'dshpc-doc-example__title' }, props.title),
      props.hint === undefined
        ? null
        : h('div', { className: 'dshpc-doc-example__hint' }, props.hint),
    ),
    h(
      'div',
      { className: 'dshpc-doc-example__body' },
      h(
        'div',
        { className: 'dshpc-doc-example__demo' },
        h('div', { className: 'dshpc-doc-label' }, t('docPreview')),
        props.children ?? null,
      ),
      props.code === undefined
        ? null
        : h(
            'div',
            { className: 'dshpc-doc-example__code' },
            h('div', { className: 'dshpc-doc-label' }, t('docCode')),
            h(
              'div',
              { className: 'dshpc-doc-example__scroll' },
              h(CodeBlock, {
                code: props.code,
                lang: 'tsx',
                showHeader: true,
                copyLabel: t('docCopy'),
                copiedLabel: t('docCopied'),
              }),
            ),
          ),
    ),
  )
}

/** API 表：属性 | 类型 | 默认值 | 说明（说明走字典或 docData，随语言切换）。title 用于一张表说不清时区分是哪组 API。 */
export function ApiTable(props: { rows: readonly ApiRow[]; title?: string }): ReturnType<typeof h> {
  return h(
    'div',
    { className: 'dshpc-doc-block' },
    h(
      'div',
      { className: 'dshpc-doc-label', style: props.title === undefined ? undefined : { textTransform: 'none' } },
      props.title ?? t('docApi'),
    ),
    h(
      'table',
      { className: 'dshpc-doc-api' },
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          h('th', null, t('docApiName')),
          h('th', null, t('docApiType')),
          h('th', null, t('docApiDefault')),
          h('th', null, t('docApiDesc')),
        ),
      ),
      h(
        'tbody',
        null,
        props.rows.map((row) =>
          h(
            'tr',
            { key: row.name },
            h('td', null, row.name),
            h('td', null, row.type),
            h('td', null, row.def),
            h('td', null, row.desc ?? t(row.descKey ?? 'docApiDesc')),
          ),
        ),
      ),
    ),
  )
}

// —— 以下四个从 docData[sectionId] 直接渲染文档体；与上面的 Example/Note/ApiTable 共用外观 ——

/**
 * 把某 section 的 prose 渲染成【一个】Note：框内按段落换行（一个 prose 项 = 一段），
 * 不再一段一个框。顺序同 .doc.ts。
 */
export function DocProse(props: { id: string }): ReactNode {
  const section = DOC_DATA[props.id]
  if (section?.prose === undefined) return null
  const l = locale()
  return h(
    Note,
    null,
    h(
      'div',
      { className: 'dshpc-doc-note__content' },
      ...section.prose.map((p, i) => h('div', { key: i, className: 'dshpc-doc-note__p' }, p[l])),
    ),
  )
}

/** 把某 section 的 api 表渲染成一组 ApiTable（一个 section 可有多张表，按数组顺序）。 */
export function DocApi(props: { id: string }): ReactNode {
  const section = DOC_DATA[props.id]
  if (section?.api === undefined) return null
  const l = locale()
  return h(
    Fragment,
    null,
    ...section.api.map((table, i) =>
      h(ApiTable, {
        key: i,
        rows: table.rows.map((r) => ({
          name: r.name,
          type: r.type,
          def: r.def,
          required: r.required,
          desc: r.desc[l],
        })),
      }),
    ),
  )
}

/** 把某 section 的 code 渲染成一组 CodeOnly（用法 / 安装这类纯代码块）。 */
export function DocCode(props: { id: string }): ReactNode {
  const section = DOC_DATA[props.id]
  if (section?.code === undefined) return null
  return h(
    Fragment,
    null,
    ...section.code.map((c, i) => h(CodeOnly, { key: i, code: c.src, lang: c.lang })),
  )
}

/** 一个 section 的完整文档体：prose → api → code（顺序同 .doc.ts）。 */
export function DocContent(props: { id: string }): ReactNode {
  return h(
    Fragment,
    null,
    h(DocProse, { id: props.id }),
    h(DocApi, { id: props.id }),
    h(DocCode, { id: props.id }),
  )
}
