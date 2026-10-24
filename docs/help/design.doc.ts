// design 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const minimal = `import { createStyleKit } from 'dsh-plugin-core/design'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui' })
kit.applyStyle('tokens', kit.tokensCss)
// 之后自己的样式域：
kit.applyStyle('widget', '.widget{color:var(--dshpc-fg)}')`

const doc: DocTopic = {
  title: { zh: 'design —— 样式层', en: 'design — styling layer' },
  exports: ['createStyleKit', 'DARK_THEME_SELECTOR', 'StyleKit', 'StyleKitOptions'],
  sections: [
    {
      id: 'foundation',
      heading: { zh: '概览', en: 'Overview' },
      prose: [
        {
          zh: '零 React、无组件。装的是「值 + 注入机制」：token 变量表、注入器工厂、主题判据。',
          en: 'Zero React, no components. It ships values plus an injection mechanism: the token variable table, the injector factory, and the theme predicate.',
        },
        {
          zh: '只想统一配色/尺寸但自己写组件的插件，只引这一个就够。',
          en: 'A plugin that wants unified color/size but writes its own components needs only this subpath.',
        },
      ],
    },
    {
      id: 'foundation-exports',
      heading: { zh: '导出', en: 'Exports' },
      api: [
        {
          id: 'design-exports',
          rows: [
            { name: 'createStyleKit(options)', type: '', def: '', desc: { zh: '领一套本插件专属的样式设施（必调）', en: 'Acquire a plugin-scoped styling kit (must call)' } },
            { name: 'DARK_THEME_SELECTOR', type: '', def: '', desc: { zh: '明暗判据选择器常量 `body[data-ds-dark-theme]`', en: 'Dark-mode predicate selector constant `body[data-ds-dark-theme]`' } },
            { name: 'type StyleKit / StyleKitOptions', type: '', def: '', desc: { zh: '类型', en: 'Types' } },
          ],
        },
      ],
    },
    {
      id: 'foundation-createStyleKit',
      heading: { zh: 'createStyleKit(options)', en: 'createStyleKit(options)' },
      api: [
        {
          id: 'createStyleKit-params',
          rows: [
            {
              name: 'id',
              type: 'string',
              required: '是',
              def: '—',
              desc: {
                zh: '`<style>` 标签 id，多插件同页靠它互不覆盖，必须插件内唯一。空串抛错',
                en: 'The `<style>` tag id; on a page with multiple plugins it prevents overlaps and must be unique within the plugin. Empty string throws',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'foundation-styleKit',
      heading: { zh: '返回的 StyleKit', en: 'Returned StyleKit' },
      api: [
        {
          id: 'styleKit-members',
          rows: [
            { name: 'id', type: 'string', def: '—', desc: { zh: '回显', en: 'Echoed back' } },
            { name: 'tokensCss', type: 'string', def: '—', desc: { zh: '已替换前缀的 token CSS 文本', en: 'Token CSS text with the prefix already substituted' } },
            { name: 'cssVar(name)', type: '(name: string) => string', def: '—', desc: { zh: '拼变量名：`cssVar(\'fg\')` ⇒ `--acme-fg`', en: 'Build a var name: `cssVar(\'fg\')` ⇒ `--acme-fg`' } },
            { name: 'registerStyle(domain, css)', type: '(domain: string, css: string) => void', def: '—', desc: { zh: '登记一个域的 CSS；同名重复登记 = 覆盖', en: 'Register a domain’s CSS; re-registering the same domain overwrites' } },
            { name: 'ensureStyles()', type: '() => void', def: '—', desc: { zh: '确保标签已挂载且内容最新（幂等；无 document 静默跳过）', en: 'Ensure the tag is mounted and current (idempotent; silently skips without document)' } },
            { name: 'applyStyle(domain, css)', type: '(domain: string, css: string) => void', def: '—', desc: { zh: '登记 + 立刻挂载', en: 'Register and mount immediately' } },
            { name: 'dispose()', type: '() => void', def: '—', desc: { zh: '撤掉标签并清空登记域（插件卸载 / HMR 时用）', en: 'Remove the tag and clear registered domains (on plugin unload / HMR)' } },
          ],
        },
      ],
    },
    {
      id: 'foundation-minimal',
      heading: { zh: '最小可用', en: 'Minimal usage' },
      code: [{ id: 'design-minimal', lang: 'ts', src: minimal }],
    },
    {
      id: 'foundation-tokens',
      heading: { zh: 'token 口径', en: 'Token conventions' },
      prose: [
        {
          zh: 'token 覆盖颜色 / 尺寸 / 字号 / 层级，**含深色覆盖段**。取值一律走 `var(--dshpc-*)`，不在规则里写死颜色值。',
          en: 'Tokens cover color / size / font-size / elevation, **including the dark-mode override block**. Always read values via `var(--dshpc-*)`, never hard-code colors in rules.',
        },
        { zh: '完整清单与命名口径：前景 / 背景 / 边框 / 间距 / 字号 / 语义色七类，`--dshpc-` 前缀，含深色覆盖段。', en: 'Full inventory and naming: seven families (foreground / surface / border / spacing / font / semantic color / semantic surface), all `--dshpc-` prefixed, with a dark-mode override block.' },
      ],
    },
    {
      id: 'foundation-customize',
      heading: { zh: '定制边界', en: 'Customization boundary' },
      prose: [
        {
          zh: 'token 的**前缀固定 `dshpc`**（不参数化、不按插件改名）；token 的**内容**（有哪些变量、值是什么）是本包定的审美标准，消费方通过覆盖变量值来适配，不要改本包源码。',
          en: 'The token **prefix is fixed to `dshpc`** (not parameterized, not renamed per plugin); the token **content** (which variables exist, what values) is this package’s aesthetic standard — consumers adapt by overriding variable values, not by editing this package’s source.',
        },
        { zh: '要整套换肤：给同一批变量名赋新值即可，不需要 fork。', en: 'To reskin entirely: assign new values to the same variable names; no fork needed.' },
      ],
    },
  ],
}

export default doc
