# 20261018-1351-pnpm-store-迁到-code-同挂载点-硬链接-97-6-生效-a53c

> **✅ 完成封卷**：2026-10-18 13:52:04（@GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6）
> **创建**：2026-10-18 13:51:00（@GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6）
> **分类**：建设 ｜ **标签**：pnpm、store、硬链接

## 背景

上一个任务（`20261018-1307`）查清「硬链接 0% 生效」但没解决。用户追问「为什么会落空、到底应该
什么样、成不成熟，去网上查」。本任务：查证 + 根治。

## 待办

无（已解决）。

## 下一步

另两个仓（dispatch / ledger）切 pnpm 时，确认 `storeDir` 配置仍在（见 AGENTS.md）。

## 过程

**网上查证（不凭记忆）**：

1. **机制成熟度**：pnpm 官网自称 "Fast, disk space efficient package manager"，36,775 star，
   官网列出的使用者含 Next.js / Vue / Vite / Angular / Nuxt / Astro / Prisma / Vercel / Nx。
   内容寻址 store + 硬链接是它的**核心设计**，不是实验特性。
2. **「落空」是官方已知场景**：pnpm 12.4.1 changelog 原文 ——
   "pnpm install no longer fails with Operation not permitted when the filesystem refuses a hard link
   or a copy-on-write clone #14722. Under packageImportMethod: auto and clone-or-copy, pnpm copies
   the file instead. EdenFS checkouts, which have no hard links, and rootless containers, ..."
   ⇒ 文件系统拒绝硬链接时**静默降级为 copy** 是设计行为。
3. **FUSE 普遍不支持硬链接**：Alluxio FUSE 的 POSIX 兼容表把「硬链接 (ln)」明确列在**不支持**；
   nomsfs 已知限制同样列明。多篇中文排查文结论一致：跨文件系统 / bind mount / Docker layer /
   网络磁盘 ⇒ 硬链接失败降级 copy。
4. **官方配置位置**：node_modules 结构相关设置（`packageImportMethod` 等）**必须放
   `pnpm-workspace.yaml`**，不能只放 `.npmrc` / 全局 `config.yaml`（我之前放错了位置，
   但即使放对也救不了跨挂载点）。

**本机根因（实测复现，不是推断）**：

```
stat -c %d /code 与 /opt/node-persist  → 都是 156（假象，FUSE 上不可靠）
ln <store 里的文件> <项目目录>          → Invalid cross-device link
```

⇒ `/code` 与 `/opt/node-persist` 是**两个独立挂载点**，硬链接跨不过去（Linux 硬约束）。

**根治**：把 store 迁到与项目同一挂载点 `/code/dsh-plugins/.pnpm-store`（三仓共用），
`pnpm config set store-dir`（写入 `/root/.config/pnpm/config.yaml`）。

**结果**：

| 指标 | 迁移前 | 迁移后 |
|---|---|---|
| 硬链接生效比例 | 0.0% | **97.6%**（244/250，inode 对账） |
| 构建 / 测试 | 0 error / 33 过 | 0 error / 33 过 |

非链接的那 6 个文件是 store 里没有对应项的（如 `.bin` 脚本），属正常。

## 结论

硬链接机制成熟，落空原因是**本机 `/code` 与 `/opt/node-persist` 是两个挂载点**（跨设备硬链接
被内核拒绝）。store 迁到 `/code/dsh-plugins/.pnpm-store` 后 **97.6% 生效**，
多仓共享省空间的收益真正成立（第二、第三个仓装依赖时共享部分走硬链接、几乎零新增占用）。

**注意**：

- `storeDir` 是**机器级配置**（`/root/.config/pnpm/config.yaml`），**没进仓**——换机器要重设，
  已写进 `AGENTS.md`「本机 pnpm 环境」节。
- 单仓体积仍是 33M（vs npm 25M），差异来自 peer 隔离与 du 统计方式；**多仓共享后总占用才会反超 npm**。
- 旧 store `/opt/node-persist/pnpm-store`（434M）已无人用，可清理（未擅自动，等用户确认）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
