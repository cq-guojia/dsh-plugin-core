# 20261020-2254-explorer-子包-工作区文件浏览与预览-dock-预览-选择弹窗两能力-6152：explorer 子包：工作区文件浏览与预览（dock 预览 + 选择弹窗两能力）

> **创建**：2026-10-20 22:54:32（@GuoJia-Agent）
> **分类**：功能 ｜ **标签**：explorer、文件预览、dock、picker、官方件

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

<!-- 为什么做：触发它的原话 / 现象 / 链接 -->

## 待办

<!-- 还没做的、没验证的、等别人给东西的 -->

## 下一步

<!-- 下一个具体动作（文件:行号 级别），不要写「继续推进」 -->

## 过程

<!-- 踩坑与证据：带 revision + 文件:行号 或符号名 -->

## 结论

<!-- 做成了什么、留了什么坑 -->

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 22:54:32 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 22:55:52 · log · @GuoJia-Agent · 填正文：背景=用户两能力定义+拍板口径表+兄弟项目7条问题清单；待办9项；下一步读实现依赖现状文件
- 2026-10-20 23:27:43 · log · @GuoJia-Agent · 交付：FileBrowser 面板 + openFilePreview/pickWorkspaceFile 两能力 + 六档预览体 + ./ui/official 通路；build/build:demo/73 测试/codelint 全过；正文曾被拉取回滚已重写；待用户真机验收
- 2026-10-21 01:18:31 · log · @GuoJia-Agent · 本轮：openFilePreview 改挂核心 PanelDock、FileBrowser 全换核心按钮并统一高度档、▾ 反转为准 兄弟度量的自写浮层、demo 改接 remote.workspaceFiles + 真样例文件 + pickWorkspaceAnchor 锚点；build/tests 74/codelint 全过，待真机验收
- 2026-10-21 07:44:21 · log · @GuoJia-Agent · 分栏纠偏：openFilePreview 新增必填 mount，dock 用 DockPanel header=null 挂进调用方 flex 行（不再 body+fixed 浮层）；explorer.css 按兄弟 .dsh-tdt-sv-* 逐条重抄；行尾文案改「选择」；picker 补 translate 注入
