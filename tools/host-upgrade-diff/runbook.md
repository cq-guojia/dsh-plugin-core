# 宿主升级差异核对 · 工作执行手册

**怎么用**：宿主升级后会话预览出现样式错位时，把本文件交给 Agent，说「按这个工作手册执行」。
本手册是普通 MD，不自动触发、不注入 skill。Agent 只按步骤走到「出差异清单」为止，
**改代码另起任务**，不在本手册内。

## 边界（先读）

- 只取**一版**官方 npm 发布产物，与本仓源码做差集；不下旧版、不建基线 / 快照。
- **严禁任何形式安装**：不 `npm install`、不 `npm i -g`、不 `pnpm add`；
  不写 `node_modules`、不改 `package.json` / lockfile。`npm view` / `npm pack` 只是取包。
- 脚本只做解析 / 抽取 / 差集 / 打印 / gate；**取包、读官方实现本体、判读、改代码归 Agent**。
- 不改 `docs/dependencies/dsh-host.md`、不改 `docs/README.md` 槽位表、不在 `docs/` 下新增文档。

## 步骤

### 1. 定版本

看本仓单一真源 `src/adv/session/official-classes.ts` 的 `ALIGNED_HOST_VERSION`（这是「我们上次对齐到哪」，
只作参照，不限制取哪一版）。用户指定了版本就用指定版本；没指定就取 `latest`——
**先解析成一个具体版本号，再让所有包用同一个号**，否则各包的 `latest` 可能不同。
脚本 gate ① 对**全部 9 个包**校验版本一致性，混版会拦下。

本轮宿主的包名清单写在步骤 2 的 `PKGS=` 里，只维护这一份。
其中 5 个注入包（chat / tool / skill / deliverables / sidebar-documentpreview）由本仓
`src/adv/session/official-classes.ts` 的 `CSS_PKG_PREFIXES` 作为真源校验，也是类名面的唯一来源；
**其余 4 个包漏取时 gate ① 不会拦**，跑完请核对清单第 1 节列出的包数是否为 9。

### 2. 取一版产物到临时目录（不安装）

`npm pack --pack-destination` 需 npm ≥ 7.18（代码块第一行会打印版本）；
老 npm 会静默忽略该参数、把 tgz 落到当前目录，故末尾有一道 tgz 数量检查。
整段在临时目录工作，tgz 与解包内容都不要放进仓库。
**步骤 3、4 用仓库根相对路径，需在仓库根执行**。

```bash
set -euo pipefail
npm --version
HOST_VERSION=""   # 用户指定了版本就填这里，例如 0.2.3-rc.1；留空取 latest
VERS="${HOST_VERSION:-$(npm view @deepseek-ai/dsh-client-ui-chat dist-tags.latest 2>/dev/null | tr -d '"' | tr -d '\r' | head -n1)}"
echo "本次核对版本：$VERS"
WORK="$(mktemp -d)"
mkdir -p "$WORK/dl" "$WORK/unpack"
PKGS="dsh-client-ui-chat dsh-client-ui-tool dsh-client-ui-skill dsh-client-ui-deliverables dsh-client-ui-sidebar-documentpreview dsh-client-ui-primitives dsh-client-ui-renderer dsh-client-ui-theme dsh-client-ui-conversation"
for n in $PKGS; do
  npm pack "@deepseek-ai/$n@$VERS" --pack-destination "$WORK/dl"
done
shopt -s nullglob
files=("$WORK/dl"/*.tgz)
if [ "${#files[@]}" -ne 9 ]; then echo "只拿到 ${#files[@]} 个 tgz，检查 npm 版本与取包结果"; exit 1; fi
for f in "${files[@]}"; do
  d="$WORK/unpack/$(basename "$f" .tgz)"
  mkdir -p "$d"
  tar -xzf "$f" -C "$d"
done
echo "解包根目录：$WORK/unpack"
printf 'node tools/host-upgrade-diff/scripts/diff.mjs "%s"\n' "$WORK/unpack"
```

npm 对 scoped 包的 tgz 命名是 `deepseek-ai-<包名>-<版本>.tgz`，故解包结构是
`$WORK/unpack/deepseek-ai-<包名>-<版本>/package/`；脚本按目录内 `package.json` 的 `name` 认包，
与目录名无关。最后一行是**可直接粘贴的步骤 4 命令**（绝对路径已填好，不必记 `$WORK`）。

### 3. 先跑自检

```bash
node tools/host-upgrade-diff/scripts/diff.mjs --self-check
```

不过就别往下走：解析规则可能已经给不出正确清单。自检不挂项目 `pnpm test`。

### 4. 跑 gate + 比对

把步骤 2 打印的最后一行 `node tools/.../diff.mjs "<绝对路径>"` 整行粘贴执行即可，
不要手写路径、不要带尖括号占位符。

- gate 4 项任一失败 ⇒ 退出码 1、**不产出清单**，gate 4 项实测值与产物内坐标打到 stderr。
  这时先读官方 `lib/client.js` 定位形态变化，改 `diff.mjs` 的解析规则后重跑，不要改 gate 判据去迁就产物。
  产物连 `package.json` 都读不了时会以退出码 1 报「产物不可读」（该分支不打印 gate 实测值），不会抛裸异常。
- gate 全过 ⇒ 分组清单既打印到对话，也落盘
  `tools/host-upgrade-diff/log/<YYYYMMDD-HHmmss>.md`（`log/` 不入库）。

### 5. 判读清单（Agent 的活）

按 `output-template.md` 七章节逐节读，重点是：

1. **第 3 节「本仓失效项」**：本仓引用、官方当前版已无的 `模块.语义名`，逐条回源码看是否要改。
   类面只取 `CSS_PKG_PREFIXES` 的 5 个注入包，与 `official-classes.ts` 运行时同源。
2. **第 4 节「官方有本仓未接」**：已按本仓已用模块过滤，语义名全列不截断；单版比对只能说
   「官方有、我们没接」，不能说「相对上次新增了 X」，别当成回归。其余官方模块整块略过，见第 6 节。
3. **第 5 节「规则与导出变化」**：两侧都是 token 集合差、混着自绘属性与运行时属性，只作线索，
   **不可直接当成「官方删了 / 新增了」**。
4. **第 6 节「必须人工读官方实现本体」**：逐项打勾。上一轮五轮真机反馈里 4 处是
   「类名还在、但官方组件 / 原语 / 策略换了」，纯 CSS 差集一条都发现不了 —— 这一节才是重点。
   读官方实现要读到方法签名 / 判空 / 抛错分支，不是只看 `.d.ts`。

### 6. 留痕与收尾

- 结论写进 commit message（`docs/README.md:46`：版本历史交给 git）；过程叙事交 task-ledger。
- 后续改代码、build、发版由用户一句话另起任务，**本手册不执行**。
