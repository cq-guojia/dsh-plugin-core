// 帮助文档索引 —— 真源（TS 数据模块）。内容全在此一处：md 投影与 demo 站都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const doc: DocTopic = {
  title: { zh: '帮助索引', en: 'Help index' },
  sections: [
    {
      id: 'help-index',
      heading: { zh: '按你要做的事挑一份', en: 'Pick the one you need' },
      prose: [
        {
          zh: '本索引只回答「读哪一份」。按你要做的事挑一行，跳过去读完就能写代码。',
          en: 'This index answers one question: which document to read. Pick the row matching your task.',
        },
        {
          zh: '文件都在同一目录（`docs/help/`）：`<主题>.md` 给人读，同名的 `.doc.ts` 是真源。改内容请改真源后重跑 `node scripts/gen-docs.mjs`，`.md` 由它生成。',
          en: 'Everything lives in `docs/help/`: `<topic>.md` is what you read, the `<topic>.doc.ts` beside it is the source. Edit the source, then rerun `node scripts/gen-docs.mjs` — the `.md` is generated.',
        },
      ],
      api: [
        {
          id: 'help-index-table',
          rows: [
            {
              name: '把这个包接进我的插件',
              type: 'integration.md',
              def: '—',
              desc: { zh: '装包、初始化样式、最小可用控件与工具函数、清理，一条龙示例', en: 'Install, style init, minimal working controls and helpers, teardown — end to end' },
            },
            {
              name: '用控件（按钮 / 输入 / 选择器 / 弹窗 / 右侧分栏）',
              type: 'ui.md',
              def: '—',
              desc: { zh: '控件清单与全部 props；弹窗与 PanelDock 的布局约定在此', en: 'Control inventory and every prop; dialog and PanelDock layout contracts are here' },
            },
            {
              name: '建 style kit、覆盖 token、多插件同页隔离',
              type: 'design.md',
              def: '—',
              desc: { zh: 'design 子包的 API：`createStyleKit` / `registerStyle` / 注入机制', en: 'The `design` subpackage API: `createStyleKit` / `registerStyle` / how injection works' },
            },
            {
              name: '处理日期、字符串、字节、HTTP',
              type: 'utils.md',
              def: '—',
              desc: { zh: '纯函数清单与参数，含每个函数的失败返回值', en: 'Pure helpers and their arguments, including each one’s failure return' },
            },
            {
              name: '加工作区文件浏览与预览',
              type: 'explorer.md',
              def: '—',
              desc: { zh: '右侧分栏预览与文件选择器；都要宿主提供的工作区快照', en: 'Right-dock preview and file picker; both need the host workspace snapshot' },
            },
            {
              name: '把一次会话渲染成只读预览',
              type: 'session.md',
              def: '—',
              desc: { zh: '会话数据链与弹窗 props；归档会话同样可读', en: 'The session data chain and dialog props; archived sessions read fine too' },
            },
            {
              name: '查方法的统一口径（失败不抛错、兜底不编造）',
              type: 'methods.md',
              def: '—',
              desc: { zh: '所有 utils 方法的共同行为约定，写调用代码前先看它', en: 'Shared behavior contract of every utils helper — read before writing call sites' },
            },
            {
              name: '用 token、配色或定制皮肤',
              type: 'style.md',
              def: '—',
              desc: { zh: 'token 清单、明暗判据、能改什么改到哪为止', en: 'Token inventory, dark-mode predicate, and how far customization goes' },
            },
          ],
        },
      ],
    },
  ],
}

export default doc
