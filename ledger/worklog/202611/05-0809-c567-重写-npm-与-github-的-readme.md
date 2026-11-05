# 20261105-0809-c567-重写-npm-与-github-的-readme: 重写 NPM 与 GitHub 的 README

- **Tags**: README, 文档, NPM, 中英双语
- **Status**: doing · 2026-11-05 08:19:54 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-05 08:09:40 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-05 原话：「改 NPM 和 GitHub 的 README。把我们整个组件库的这些功能都说明，并写清楚它适配于什么」「正常使用英文，并附上一个简体中文的链接」「我这里给你截了一些截图，你把这些截图放到 README 里面……放过去了之后，就可以把这个文件夹删除了」「注意是有两个项目，一个是核心的控件，一个是 demo」「demo 你要显示出来，让他怎么安装就用 DSH 那个命令……然后通过 NPM 安装的命令就行」。

要动的两个 npm 门面：`dsh-plugin-core`（根 `README.md`）与 `dsh-plugin-core-demo`（`packages/demo/README.md`）。原来两份都是纯中文、无截图、无适配范围。

## To Do

- 待用户验收：README 渲染效果（截图 + 中文链接）需 push 后才能在 GitHub / npm 上看到。
- 未获提交授权：改动尚未 commit / push。

## Next

待用户验收 `README.md`、`README.zh-CN.md`、`packages/demo/README*.md` 四份文件；验收通过后按用户指令提交（含 `docs/assets/readme/*.png`）。

## Process

- 截图 5 张（工作区浏览 / 动作 / 录入 / 设计基础 / 会话预览）从 `111/` 搬到 `docs/assets/readme/01-tokens.png`…`05-session.png`：根 `package.json:64-67` 的 `files` 只含 `dist` / `docs`，放 `docs/` 下才会随 npm 包发布。
- 图片与文档链接一律用绝对地址（jsDelivr / `github.com/.../blob/main/`）：npm 站点对 README 里的相对路径不可靠，绝对地址在 GitHub 与 npm 同时成立。
- 沿用的既有事实：`setStyleKit` 先行、具名引入才摇树（`src/ui/index.ts:1-5`）、`DARK_THEME_SELECTOR = body[data-ds-dark-theme]`（`docs/help/style.md:35`）、`ui` 入口零 `@deepseek-ai/*`（`src/ui/official.ts:1-18`）、Button 18 档（`docs/help/ui.md:38`）、PanelDock 是布局成员（`docs/help/ui.md:829`）。
- 新增两份中文版并在 `docs/README.md` 槽位表登记一行（英文为正文、简中为翻译，不另立一份正文）。
- `pnpm test` 295 项全过（含 `gen-css --check` / `gen-docs --check` / 根与 demo 的 tsc），改文档未破坏生成物。
- `111/` 已按用户指令删除。

## Conclusion

- 根 `README.md` 改为英文正文 + 顶部简中链接；`README.zh-CN.md` 为对应中文版。内容覆盖：定位与三条设计取向、5 张截图、安装、快速开始、10 个子路径对照表、六个子包逐项功能说明、适配范围表（宿主 / Node / React / 主题 / 命名 / 官方面 / 打包 / 数据）、demo 插件（DSH 命令 + npm 命令）、文档索引、发版、许可。
- `packages/demo/README.md` 改为英文 + 简中链接，`README.zh-CN.md` 为中文版；讲清两个包的分工、两种安装方式、演示页面清单、截图、适配范围、从源码构建、发版约束。
- 截图落 `docs/assets/readme/`（5 个文件），`111/` 已删。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261105-0809-c567-重写-npm-与-github-的-readme --note "...". -->
- 2026-11-05 08:09:40 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-05 08:19:54 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 四份 README 重写完成（根 + demo，各英/简中），截图落到 docs/assets/readme/，111/ 已删；pnpm test 295 项全过；待用户验收后再提交
