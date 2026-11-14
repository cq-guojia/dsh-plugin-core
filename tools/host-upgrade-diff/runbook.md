# 宿主升级差异核对 · 工作执行手册

**怎么用**：宿主升级后会话预览出现样式错位时，把本文件交给 Agent，说「按这个工作手册执行」。
本手册是普通 MD，不自动触发、不注入 skill。Agent 只按步骤走到「出差异清单」为止，
**改代码另起任务**，不在本手册内。

## 边界（先读）

- 只取**一版**官方 npm 发布产物，与本仓源码做差集；不下旧版、不建跨版本快照。
- 唯一入库的基线是 `--contract` 从官方 `src/` 生成的 `baseline.json`（1:1 复刻契约，见步骤 6），不是版本快照。
- **严禁任何形式安装**：不 `npm install`、不 `npm i -g`、不 `pnpm add`；
  不写 `node_modules`、不改 `package.json` / lockfile。`npm view` / `npm pack` 只是取包。
- 脚本只做解析 / 抽取 / 差集 / 打印 / gate；**取包、读官方实现本体、判读、改代码归 Agent**。
- 不改 `docs/dependencies/dsh-host.md`、不改 `docs/README.md` 槽位表、不在 `docs/` 下新增文档。

## 步骤

### 1. 定版本

看本仓单一真源 `src/adv/session/official-classes.ts` 的 `ALIGNED_HOST_VERSION`（这是「我们上次对齐到哪」，
只作参照，不限制取哪一版）。用户指定了版本就用指定版本；没指定就取 `latest`——
**先解析成一个具体版本号，再让所有包用同一个号**，否则各包的 `latest` 可能不同。
脚本 gate ① 对**全部 13 个包**校验版本一致性，混版会拦下。

本轮宿主的包名清单写在步骤 2 的 `PKGS=` 里，只维护这一份，共 13 个；包数不要在别处再写死，
步骤 2 的 tgz 检查按 `PKGS` 的词数自动核对。
其中 8 个注入包（chat / tool / skill / attachment / deliverables / sidebar-documentpreview /
approval / user-questions）由本仓 `src/adv/session/official-classes.ts` 的 `CSS_PKG_PREFIXES`
作为真源校验，也是类名面的唯一来源；`user-questions` 在 `0.2.2-rc.3` 起有同号 npm 包
（rc.1 时还是未发布的外壳包），不要按旧结论跳过它。
**其余 5 个包（primitives / renderer / theme / conversation / slots）漏取时 gate ① 不会拦**
（`slots` 产物只有 `src/*.ts` 与 `lib/index.js`，不进类面也不出 CSS / TSX；取它是给
`docs/dependencies/dsh-host.md` 的 `renderSlot` 事实留证据，并让基线包清单与取包清单同号），
跑完请核对清单第 1 节列出的包数是否为 13。

### 2. 取一版产物到临时目录（不安装）

`npm pack --pack-destination` 需 npm ≥ 7.18（代码块第一行会打印版本）；
老 npm 会静默忽略该参数、把 tgz 落到当前目录，故末尾有一道 tgz 数量检查。
整段在临时目录工作，tgz 与解包内容都不要放进仓库。
**步骤 3、4、6 用仓库根相对路径，需在仓库根执行**。

```bash
set -euo pipefail
npm --version
HOST_VERSION=""   # 用户指定了版本就填这里，例如 0.2.2-rc.3；留空取 latest
VERS="${HOST_VERSION:-$(npm view @deepseek-ai/dsh-client-ui-chat dist-tags.latest 2>/dev/null | tr -d '"' | tr -d '\r' | head -n1)}"
echo "本次核对版本：$VERS"
WORK="$(mktemp -d)"
mkdir -p "$WORK/dl" "$WORK/unpack"
PKGS="dsh-client-ui-chat dsh-client-ui-tool dsh-client-ui-skill dsh-client-ui-attachment dsh-client-ui-deliverables dsh-client-ui-sidebar-documentpreview dsh-client-ui-approval dsh-client-ui-user-questions dsh-client-ui-primitives dsh-client-ui-renderer dsh-client-ui-theme dsh-client-ui-conversation dsh-client-ui-slots"
for n in $PKGS; do
  npm pack "@deepseek-ai/$n@$VERS" --pack-destination "$WORK/dl"
done
shopt -s nullglob
files=("$WORK/dl"/*.tgz)
expected=$(wc -w <<<"$PKGS" | tr -d ' ')
if [ "${#files[@]}" -ne "$expected" ]; then echo "只拿到 ${#files[@]} 个 tgz（期望 $expected 个），检查 npm 版本与取包结果"; exit 1; fi
for f in "${files[@]}"; do
  d="$WORK/unpack/$(basename "$f" .tgz)"
  mkdir -p "$d"
  tar -xzf "$f" -C "$d"
done
echo "解包根目录：$WORK/unpack"
printf 'node tools/host-upgrade-diff/scripts/diff.mjs "%s"\n' "$WORK/unpack"
printf 'node tools/host-upgrade-diff/scripts/diff.mjs --contract "%s"\n' "$WORK/unpack"
```

npm 对 scoped 包的 tgz 命名是 `deepseek-ai-<包名>-<版本>.tgz`，故解包结构是
`$WORK/unpack/deepseek-ai-<包名>-<版本>/package/`；脚本按目录内 `package.json` 的 `name` 认包，
与目录名无关。最后两行是**可直接粘贴的步骤 4 / 6 命令**（绝对路径已填好，不必记 `$WORK`）。

### 3. 先跑自检

```bash
node tools/host-upgrade-diff/scripts/diff.mjs --self-check
```

不过就别往下走：解析规则可能已经给不出正确清单。`--self-check` 与 `--contract-check` 都挂在
`package.json` 的 `pretest`，日常 `pnpm test` 会自动跑；本步骤单独跑一次便于读输出。

### 4. 跑 gate + 比对

把步骤 2 打印的倒数第二行 `node tools/.../diff.mjs "<绝对路径>"` 整行粘贴执行即可，
不要手写路径、不要带尖括号占位符。

- gate 4 项任一失败 ⇒ 退出码 1、**不产出清单**，gate 4 项实测值与产物内坐标打到 stderr。
  这时先读官方 `lib/client.js` 定位形态变化，改 `diff.mjs` 的解析规则后重跑，不要改 gate 判据去迁就产物。
  产物连 `package.json` 都读不了时会以退出码 1 报「产物不可读」（该分支不打印 gate 实测值），不会抛裸异常。
- gate 全过 ⇒ 分组清单既打印到对话，也落盘
  `tools/host-upgrade-diff/log/<YYYYMMDD-HHmmss>.md`（`log/` 不入库）。

### 5. 判读清单（Agent 的活）

按 `output-template.md` 七章节逐节读，重点是：

1. **第 3 节「本仓失效项」**：本仓引用、官方当前版已无的 `模块.语义名`，逐条回源码看是否要改。
   类面只取 `CSS_PKG_PREFIXES` 的 8 个注入包，与 `official-classes.ts` 运行时同源。
2. **第 4 节「官方有本仓未接」**：已按本仓已用模块过滤，语义名全列不截断；单版比对只能说
   「官方有、我们没接」，不能说「相对上次新增了 X」，别当成回归。其余官方模块整块略过，见第 6 节。
3. **第 5 节「规则与导出变化」**：两侧都是 token 集合差、混着自绘属性与运行时属性，只作线索，
   **不可直接当成「官方删了 / 新增了」**。
4. **第 6 节「必须人工读官方实现本体」**：逐项打勾。上一轮五轮真机反馈里 4 处是
   「类名还在、但官方组件 / 原语 / 策略换了」，纯 CSS 差集一条都发现不了 —— 这一节才是重点。
   读官方实现要读到方法签名 / 判空 / 抛错分支，不是只看 `.d.ts`。

### 6. 官方源码契约基线（1:1 复刻）

官方 8 个注入包的 npm 产物自带 `package/src/**/*.tsx` 与未编译的 `*.module.css`（rc.3 起核实），
这是本仓会话预览 1:1 复刻的结构 / 类名真源；宿主运行时只加载 `lib/*.js`，官方 TSX 依赖宿主
slot machinery，不能构建期编译进插件，故只作契约真源使用。

把步骤 2 打印的最后一行整行粘贴执行，再跑两道闸：

```bash
node tools/host-upgrade-diff/scripts/diff.mjs --contract "<解包根目录>"
node tools/host-upgrade-diff/scripts/diff.mjs --self-check
node tools/host-upgrade-diff/scripts/diff.mjs --contract-check
```

- `--contract`：抽每个 `*.module.css` 定义的类名 + 对应 TSX 的 `css.<语义名>` 引用，写
  `tools/host-upgrade-diff/baseline.json`（入库），打印「官方 TSX ↔ 本仓 mirror」逐模块差异。
  基线含 `pending`（本仓已用模块里官方引用而未接的项）、`usedModules`（生成时本仓在挂的模块）、
  `unusedModules`（官方有而本仓整块没接的能力面，不是债务）。
- **判定真源 `tools/host-upgrade-diff/contract-decisions.json`（入库）**：逐条写明
  `<模块>.<语义名>` 的处置 —— `aligned`（按官方原文补齐 DOM / 条件）、
  `notApplicable`（官方交互态在只读预览里不成立，硬挂类名就是假复刻）、
  `noop`（官方自身未定义或本仓已用等价原语），每条必须附官方 `文件:行号@<版本>` 证据与理由。
  1:1 的定义是「官方原文的条件与 DOM 层级一致」，不是「把类名无条件挂满」。
- `--contract-check`（只读闸，挂 `package.json` 的 `pretest`）：版本 / 基线完整性 /
  类面合法性 / 判定↔代码互证 / 模块漏抽，任一项不一致退出码 1。具体会拦：
  `aligned` 判定却没真挂类名、`notApplicable` / `noop` 判定却挂了（假复刻）、
  新差异没判定、判定证据写死旧版本、模块改成动态拼接导致整块静默免检、基线快照漂移、
  基线 `packages` 缺注入包（按 `CSS_PKG_PREFIXES` 的包名断言，不看总数 —— 凑够条数但缺注入包同样红）。
  `--contract-check` **只读基线、不重跑解析器**；注释里的类名调用不算已挂、官方 CSS 的
  `url(...)` / 引号字符串不得被收成类面这类解析侧回归，由同样挂在 `pretest` 的
  `--self-check` 断言守住（它也断言闸本体 `contractProblems`）。
- 合法类名取 CSS 定义与 TSX 引用的并集：官方后代选择器（如 `stat-dialog.module.css` 的
  `.details .route`）与伪类组合里的定义不能只按行首 `^\.` 抓。
- 宿主升级后重跑 `--contract` 刷新基线，再按 `pending` 逐条读官方 TSX 原文：
  能成立的分支按原文补，交互态不成立的写进 `contract-decisions.json` 并给证据；
  两类都要让 `--contract-check` 通过。

### 7. 留痕与收尾

- 结论写进 commit message（`docs/README.md:46`：版本历史交给 git）；过程叙事交 task-ledger。
- 后续改代码、build、发版由用户一句话另起任务，**本手册不执行**。
