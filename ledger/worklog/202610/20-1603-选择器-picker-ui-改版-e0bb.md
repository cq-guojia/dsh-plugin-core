# 20261020-1603-选择器-picker-ui-改版-e0bb：选择器（Picker）UI 改版

> **创建**：2026-10-20 16:03:53（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：选择器、Picker、样式

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户 2026-10-20 看 demo 选择器页后提的整批需求（原话口径）：

1. 所有下拉触发器右侧箭头符号不对，要换成截图里的 chevron（官方 ⌄ 形）。
2. 所有下拉框支持前面带 icon；选项最好也支持前面的 icon；demo 里要演示。
3. 下拉里的搜索框要有配置（可要可不要）。
4. ModelPicker 做两种形态：联动（选厂商→选模型）与分组（厂商做组头、模型列下面），消费者自选；关注两种形态的返回数据是否一致。
5. 删掉 FilePicker（文件选择框，没有用）。
6. 多选 bug：到上限后已选项无法取消（`Picker.ts` 的 `atMax` 把已选项也置灰了）。
7. demo 的模型 / 工作区数据不要 mock，直接读宿主真实数组（demo 是宿主端插件）。
8. 讨论：要不要给 Input/Select/Textarea 这类组件内置 `hint` 参数（自动挂 FieldHint 问号），还是让调用方自己组合。

## 待办

- [ ] Picker 触发器箭头改内联 SVG chevron（ui 零官方依赖，不能直接用官方图标组件）。
- [ ] `PickerOption.icon?: ReactNode` + `Picker` 触发器 `icon?: ReactNode`；CSS 配套。
- [ ] searchable 保持可配，包装器默认值统一（现 Picker 默认关、三个包装器默认开）。
- [ ] ModelPicker：`flat`（拍平丢分组）改为分组渲染；`cascade` 保留；两种形态返回口径统一（onChange 都发最终模型 value，cascade 换厂商先发 ''）。
- [ ] 修多选上限 bug：atMax 时已选项仍可点击取消（`Picker.ts:220,232` 与 `picker-logic.ts` `toggleValue` 对齐）。
- [ ] 删 `FilePicker`（src/ui/WorkspacePicker.ts + index.ts 导出 + demo）。
- [ ] demo 模型数据走真实目录：`ctx.inject(['remote','remote.llm'])`（dsh-session-title-pattern/src/client/index.tsx:450 已验证通路）。
- [ ] demo 工作区数据真实通路待定（见下一步）。
- [ ] demo 选择器页按新能力重排演示。
- [ ] build + 产物入库 + 验证脚本 + typecheck。

## 下一步

- 与用户对齐两点：① demo 工作区列表的 client 侧真实通路（demo 无 host 半侧；dsh-task-dispatch-table 是走自家 host 路由，demo 要么补 host 半侧要么用宿主现成 remote 面——需核实/拍板）；② hint 内置方案是否照「字段类组件加可选 `hint` prop」落地。
- 对齐后按待办顺序改 `src/ui/Picker.ts`、`ModelPicker.ts`、`WorkspacePicker.ts`、`picker.css`，再改 demo。

## 过程

<!-- 踩坑与证据：带 revision + 文件:行号 或符号名 -->

## 结论

<!-- 做成了什么、留了什么坑 -->

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 16:03:53 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 16:27:00 · log · @GuoJia-Agent · 需求入库：worklog 记 8 条（chevron/icon/搜索可配/双形态/删FilePicker/多选上限bug/真实数据/hint讨论），待对齐工作区取数通路
