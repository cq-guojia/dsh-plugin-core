# 接入后台任务中心（服务端任务）

## 适用场景

一个插件要把长任务交给服务端执行、且要求刷新页面或关掉标签页后任务继续跑、回到页面还能看到真实进度时，按这篇接入。做完得到：一个按稳定 key 幂等登记的任务中心条目，由核心主动批量问服务端状态来续租与结算。纯页面内的短任务用 `notifyTask.run` 即可，不需要这篇。

> 本文的接口均已落地，签名以 `docs/api/task-notifications.md` 为准；设计依据见 `docs/architecture/background-task-center.md`。

## 前置条件

- 服务端能按业务 key 查出作业状态（`running` / 成功 / 失败），且作业 id 存在服务端而非前端闭包里。
- 服务端作业处理器已做幂等（at-least-once 前提下可能被重复投递，这是接入方的硬义务）。
- app 入口已调用一次 `setDefaultTaskProject()` 设一级分组。

## 步骤

1. **定稳定 key。** 用不会变、可枚举的值（如 `['close', workspaceId, taskId]`），不放时间戳、随机数、进度文案。key 会进界面与日志，不放敏感信息。

2. **按项目注册一个批量状态源。** 核心会周期性调用它，一次传入该项目全部在跑的 key，返回对应的状态行。这是**必须实现**的响应方法——心跳靠它。

   ```ts
   import { taskNotifications, type StatusRow } from 'dsh-plugin-core/adv/tasks'

   taskNotifications.setStatusSource('dsh-task-dispatch-table', async (keys) => {
     // 一次请求查所有 key，不要为每个 key 发一次请求。
     const rows = await api.queryJobsByKeys(keys)   // api 由消费方提供
     return rows.map((row) => ({
       key: row.key,
       state: row.state,                          // 'running' | 'done' | 'failed'
       ...(row.reason ? { reason: row.reason } : {}),
     })) satisfies StatusRow[]
   })
   ```

3. **起作业时登记任务。** 后端任务号放在服务端、按 key 存在那里；`detail` 只放给人看的提示，不作真源。用 `created` 判断是否真的起作业——`false` 说明同 key 已在跑，别起第二份。

   ```ts
   import { notifyTask } from 'dsh-plugin-core/adv/tasks'

   const claim = notifyTask.background('正在结案', {
     key: ['close', workspaceId, taskId],
     group: 'close',
     detail: { workspaceId, taskId },   // 展示用；后端任务号由服务端按 key 存
   })
   if (!claim.created) return           // 同 key 已在跑，服务端作业也已在执行

   await api.submitCloseJob({ workspaceId, taskId })   // 作业真正在服务端启动
   ```

4. **（可选）主动加速。** 消费方主动上报可以更快反映进度，但**不写也能正常工作**——pull 心跳是主路径。别把它当唯一心跳源。

   ```ts
   claim.handle.update({ detail: { phase: '正在写回' } })   // 可选；只改展示数据
   // 有 touch() 能力时可调用它立即续租；省略不影响结算正确性。
   ```

5. **交给核心结算。** 状态源返回 `done` 核心即完成、返回 `failed` 核心即失败；查询抛错时本轮不续租也不判死，让租约自然到期。消费方不要在状态源里直接替核心结算。

6. **卸载时清理。** 组件或插件卸载调用 `dispose()`，心跳定时器（批量探测 + 双时钟检查）一并停掉，不留悬挂定时器。

## 验证

- 起一个服务端任务，刷新页面：条目用同一 key 重建，进度来自服务端真实状态，不是占位值。
- 开两个同源标签页看同一 key：两页都能显示；只有持有执行权的那页能结算。
- 让状态源连续几次返回 `running`：任务保持活跃不被误判失败；停掉响应后，租约到点任务转失败。
- 让任务跑过 `maxDurationMs`：即便一直在续租也被判超时结算，不会无限占位。
- 同 key 再起一次：`created === false`，服务端只执行一次作业。

## 常见失败

| 现象 | 原因 | 处理 |
|---|---|---|
| 刷新后任务丢失或进度不对 | 把后端任务号存在前端闭包里，刷新即失 | 后端任务号存服务端、按 key 查；`detail` 只做展示 |
| 任务被误判失败 | 状态源查询偶发抛错就被当成任务死亡 | 查询失败时本轮不续租也不判死，让租约自然到期 |
| 同一作业执行两次 | key 带了时间戳 / 随机数，或未看 `created` 就起作业 | 用稳定 key；`created === false` 时不起第二份作业 |
| 请求数随任务数暴涨 | 在任务上逐个写 probe，而非按项目注册一个批量状态源 | 改为一个状态源一次查一批 key |
| 任务跑不完也不结束 | 只靠可续租约，没有总上限 | 设 `maxDurationMs`，从 `startedAt` 算、续租不重置 |
| 卸载后状态还在被改 | 没调 `dispose()`，定时器悬挂 | 卸载路径调用 `dispose()` |
| 广播按钮进了任务中心演示 | 把通知中心的广播示例混进任务中心 | 广播属 `runtime` 通知，任务中心演示只演示任务本身 |

## 相关

- 设计契约：`docs/architecture/background-task-center.md`
- 数据面契约：`docs/architecture/task-notifications.md`
- 对外 API：`docs/api/task-notifications.md`

## 更新日志

- 2026-11-16 17:38:04：新增服务端任务接入契约：状态源、稳定 key、后端任务号存放与常见失败
- 2026-11-16 18:01:41：接入接口已落地，StatusRow 失败字段对齐为 reason，dispose 定时器口径与代码一致
- 2026-11-16 20:33:57：审计修正：dispose 一并丢弃在途探测结果
