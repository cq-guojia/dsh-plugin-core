# 20261018-0306-design-子包-token-前缀参数化-createstylekit-工厂-56ee：design 子包：token 前缀参数化 + createStyleKit 工厂

> **创建**：2026-10-18 03:06:07（@GuoJia-Agent）
> **分类**：建设 ｜ **标签**：design、token、样式注入

## 背景

需求文档 §2.1 / §5.2 / §5.3：design 要提供前缀参数化的 token 表 + 注入器工厂。
**根因**是 dispatch `src/client/ui/style.ts:25` 的模块级单例 + 固定 style id
`dsh-task-dispatch-table-ui` —— 多个插件同处一页时会抢同一个 `<style>` 标签、变量互相覆盖。

## 待办

无。

## 下一步

建任务做 `utils` 子包：日期 / 字符串 / 字节体积 / 时间区间。硬约束：不 import 任何其他子包、
不依赖 React / DOM / 宿主 API。

## 过程

**token 怎么搬**：`dsh-task-dispatch-table/src/client/ui/tokens.ts:29` 的 `UI_TOKENS_CSS`
是一个 200+ 行的模板字符串（`body{ --tdt-* }` + `body[data-ds-dark-theme]{ ... }` 深色段）。
手工转录必错 ⇒ **写 node 脚本从源文件整段提取**，生成本仓 `src/design/tokens-css.ts`
（10.7KB、142 处 `--tdt-`）。文件头注明来源，改上游时重跑脚本即可。

**前缀参数化**：不把 CSS 拆成结构化表（工作量大、易漏），而是**整串替换**——
`buildTokensCss(prefix)` 把 `--tdt-` 全部换成 `--${prefix}-`。100% 保真，代价是不能按单个 token
覆盖（需求只要求前缀隔离，够用）。`prefix` 做了入口校验（字母开头 + 字母数字连字符）。

**`createStyleKit({ id, prefix })`**：沿用 dispatch 注入器的语义（照抄它的正确性）：
按「域」登记 CSS（同名覆盖）、`tokens` 域恒排最前（变量必须先定义）、幂等挂载、
无 `document` 时静默跳过。额外加了 `cssVar(name)` 方便控件拼变量名。

**踩坑 1（会复现）**：tsc 默认输出 ESM 但 **import 不带扩展名** ⇒ Node 直接跑 dist 报
`ERR_MODULE_NOT_FOUND: ./tokens-css`。修法：`module`/`moduleResolution` 改 `NodeNext`，
**源码 import 一律写 `.js` 后缀**（`.js` 会被 TS 映射回 `.ts`）。这也是对 bundler 最友好的写法。

**踩坑 2（测试自己写错）**：断言「CSS 里不得出现 `prefers-color-scheme`」失败——
因为原文**注释里**正好写着这条禁令。改成只查真实用法：`!/@media[^{]*prefers-color-scheme/`。

## 结论

`dsh-plugin-core/design` 可用：`buildTokensCss(prefix)` + `createStyleKit({ id, prefix })`
+ `DARK_THEME_SELECTOR`。5 条 smoke 自检全过（前缀替换、深色段判据、prefix 校验、
无 DOM 静默跳过、两插件互不干扰），`npm run typecheck` 干净。

留坑：
- token 是「整串替换」，**不支持按单个 token 覆盖**。若将来出现「某插件只想改一个变量」，
  要再开任务把 CSS 拆成结构化表。
- `ensureStyles` 的真实 DOM 行为（挂载 / 幂等 / 域排序）**没有在浏览器里验过**，
  只在无 DOM 环境验了「静默跳过」。要等第一个消费者接入任务一起验。
