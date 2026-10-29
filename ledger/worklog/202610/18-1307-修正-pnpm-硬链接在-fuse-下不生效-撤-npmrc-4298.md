# 20261018-1307-修正-pnpm-硬链接在-fuse-下不生效-撤-npmrc-4298: 修正：pnpm 硬链接在 FUSE 下不生效，撤 .npmrc

- **Tags**: 缺陷修复, pnpm, 环境
- **Status**: done · 2026-10-18 13:08:19 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-10-18 13:07:42 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-10-18 13:08:19 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

上一任务（`20261018-1243` 切 pnpm）里我下了个**错误结论**：说 `.npmrc` 加
`package-import-method=hardlink` 后「追平 npm 的 25M」。用户追问
「`.pnpm/csstype@3.2.3` 下这么多文件是引用还是 copy」——查证后发现结论是错的，本任务修正。

## To Do

无（已修）。

## Next

推广 pnpm 到另两个仓前，先按本任务的实测数据重新评估（见结论）。

## Process

**查证方法**：用 inode 对账——遍历 `node_modules/.pnpm` 全部文件的 inode，
与 `pnpm-store/v11/files` 的 inode 集合求交集。

```
store 文件数：30513，唯一 inode：30513
node_modules/.pnpm 文件数：250
与 store 同 inode（硬链接）：0  ⇒ 0.0%
```

另：单文件 `stat` 显示**链接数 = 1**（硬链接至少为 2）。

⇒ **全是副本，硬链接 0% 生效。**

**根因：文件系统是 FUSE，不是 ZFS。**

- `df` 显示的 `zfsv3` 只是**底层存储池名**，挂载给容器的是 **FUSE** 文件系统
  （`stat -f -c %T` 返回 `fuse`，`/code` 与 `/opt/node-persist` 都是）。
- FUSE 实现普遍不支持或限制硬链接 ⇒ pnpm 创建硬链接失败后**静默降级为 copy**。
- 配置本身是生效的（`pnpm config get package-import-method` 能读出 `hardlink`），
  是文件系统不支持，不是配置没写对。

**上一轮 58M → 33M 的真实原因**（也纠正一下）：
不是 hardlink 生效，而是第一次 `pnpm add` **失败在中途**、`node_modules` 里残留了 npm 时代的文件
+ pnpm 的副本，是脏状态；删掉重装后才得到干净的 33M。

## Conclusion

**修正后的真实数据**：

| | npm | pnpm（干净安装） |
|---|---|---|
| core `node_modules` | 25M | **33M（大 32%）** |

大的原因：①peer 隔离结构（`scheduler` 等公共依赖在 `react` 与 `react-dom` 下各存一份）；
②硬链接/reflink 在 FUSE 上都不生效，全是副本。

**处置**：撤掉项目 `.npmrc` 与全局 `package-import-method` 配置（无效且误导），
重装验证：33M、构建 0 error、33 条自检全过。**pnpm 保留**（严格依赖 / 防幽灵依赖的价值仍在，
体积代价在小仓可接受）。

**给推广的修正建议**：另两个仓切 pnpm 前，预期 `node_modules` **涨约 30%**
（dispatch 101M ⇒ 约 130M）。若不能接受，唯一能压回体积的是 `node-linker=hoisted`
（npm 式扁平结构）——但那样会**丢掉 peer 隔离，也就丢掉了 pnpm 的主菜（防幽灵依赖）**。
要不要推广、要不要 hoisted，由用户定。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id <id> --note "...". -->
