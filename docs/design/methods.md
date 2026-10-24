# 方法规范（本仓内部）

> EN: Helper conventions (internal)

使用侧内容（统一口径与返回值约定）在帮助文档区 `docs/help/`。
本文件只留**往 `utils` 里加方法时**要守的东西。
EN: The caller-facing material (shared contract and return values) lives in `docs/help/`. What stays here is
only what you must honour when **adding a helper to `utils`**.

## 新增一个方法的 checklist

> EN: Checklist for a new helper

- [ ] 失败路径有明确兜底，且兜底可覆盖
- [ ] 边界值（空 / 0 / 负 / NaN）有测试
- [ ] 进了 `src/utils/index.ts` 出口（曾漏过 `relativeFuture`）
- [ ] 需要文案的走 `t()` + `translate` 参数
- [ ] 在帮助文档区 `docs/help/` 的对应参数表里登记一行

EN: Failure path has a clear, overridable fallback; edge cases (empty / 0 / negative / NaN) covered by tests;
exported from `src/utils/index.ts`; text goes through `t()` + `translate`; registered as a row in the
matching parameter table under `docs/help/`.
