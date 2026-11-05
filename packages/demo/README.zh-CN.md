# dsh-plugin-core-demo

[English](https://github.com/cq-guojia/dsh-plugin-core/blob/main/packages/demo/README.md) · **简体中文**

[`dsh-plugin-core`](https://www.npmjs.com/package/dsh-plugin-core) 的实时预览插件——在 DSH 侧栏里显示为**蓝鲸组件库**。

装进真实的 DSH 宿主后，每个基础控件与组合模块都用宿主自己的主题、token 和数据渲染。它没有独立的网页形态：你看到的就是一个用这套库写出来的插件该有的样子。

| | 包 | 角色 |
|---|---|---|
| 库 | `dsh-plugin-core` | 各插件按子路径引用（`/ui`、`/design`、`/utils`、`/explorer`、`/session`） |
| 插件 | `dsh-plugin-core-demo`（本包） | 装进 DSH，就地渲染这套库 |

## 安装

用 DSH 命令装进宿主：

```bash
dsh plugin --profile web add dsh-plugin-core-demo
```

或用 npm 装这个包本身：

```bash
npm install dsh-plugin-core-demo
```

装好后打开插件列表里的本插件：详情页有「组件预览」入口，点开即整页预览。侧栏入口位置（第一级 / 收入「更多」/ 关闭）是插件设置项。

## 演示了什么

| 页面 | 内容 |
|---|---|
| 设计基础 | token 色板、明暗判据、把两者弄上页面的样式注入 |
| 动作 | 按钮全部 18 档外观与三档高度、图标按钮、loading 行为 |
| 录入 | 输入框家族、选择器、日期与时间、勾选 / 开关 / 分段、问号提示 |
| 展示 | 框容器、卡片、Chip、区块标题、跑马灯与翻牌文本、带分组表头与通栏分组的表格 |
| 反馈 | 弹窗、侧边抽屉、Promise 形态的确认与提示、toast、加载图标与全局加载卡 |
| 布局与滚动 | 右侧停靠分栏、工具栏行为、组合选择框与拖宽 |
| 导航 | 独立分页，以及表格内置分页 |
| 工作区浏览 | 停靠式文件浏览与全部预览体，读的是真实工作区文件 |
| 会话预览 | 只读会话弹窗，含归档态与变更文件审阅 |
| 工具方法 | 每个方法都给出实时输入与输出，包括失败返回值 |
| 多语言 | 每条内置文案的中英对照 |

这些页面跑的都是库发布出去的同一份代码——预览插件把 core 的构建产物打进自己 bundle，所以它永远显示当前这份源码，不需要先把 core 发到 npm。

## 截图

设计基础——token、明暗判据与注入机制：

![设计基础](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/01-tokens.png)

动作——按钮：

![按钮](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/02-buttons.png)

录入：

![录入](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/03-inputs.png)

工作区浏览：

![工作区浏览](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/04-explorer.png)

会话预览：

![会话预览](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/05-session.png)

## 适配范围

| 维度 | 要求 |
|---|---|
| 宿主 | DSH web client（`client.platform: web`）；插件注册到侧栏、主区与插件设置页 |
| Node.js | `>= 22.5` |
| React / React DOM | `>= 18`，可选 peer，由宿主提供 |
| 官方模块 | `@deepseek-ai/*` 由宿主运行时解析，本包不声明为依赖 |
| 样式 | 运行时注入；变量与类名固定 `--dshpc-*` / `dshpc-*`，不碰宿主自己的前缀 |

## 从源码构建

```bash
# 在仓库根目录
pnpm run build        # 先构建库（本包引用 ../../dist/）
pnpm run build:demo   # 再构建本包 → dist/index.js（server 壳）+ dist/client.js（预览页 bundle）
```

`dist/` 与 `src/` 一起入库：宿主安装插件时不跑构建脚本。

## 发布

不要在本目录手跑 `npm publish`。库与本插件共用同一个 `vX.Y.Z` tag，由 `.github/workflows/demo-publish.yml` 发布；两个版本必须完全一致（`test/version-sync.test.mjs` 与 CI 都校验）。

```bash
# 在仓库根：一次 tag 发两个包
git tag v0.33.0 && git push origin v0.33.0
```

## 许可证

MIT
