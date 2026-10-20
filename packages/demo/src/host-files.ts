/**
 * demo 的**真实**文件数据面：`remote.workspaceFiles` / `remote.officeToPdf`。
 *
 * ⚠️ 注入键必须带 dotted 形式（`['remote', 'remote.workspaceFiles']`）——只注 `'remote'` 会在
 * remote 命名空间刚挂上时就触发回调，此刻 `workspaceFiles` 还没挂 ⇒ 探测永久失败
 * （兄弟项目 dsh-task-dispatch-table 真机根因，2026-09-28）。取值也是双保险：
 * dotted 注入值优先，退回 `remote.workspaceFiles` 属性。
 *
 * 服务缺席时保持 null，界面如实说「未就位」，绝不造假数据顶替。
 */
import type { OfficeToPdfFace, WorkspaceFilesFace } from '../../../dist/explorer/index.js'

export interface FileServicesState {
  workspaceFiles: WorkspaceFilesFace | null
  officeToPdf: OfficeToPdfFace | null
}

/** 文件服务的 observable store（useSyncExternalStore 直接消费）。 */
class FileServicesStore {
  private snapshot: FileServicesState = { workspaceFiles: null, officeToPdf: null }
  private readonly listeners = new Set<() => void>()

  readonly getSnapshot = (): FileServicesState => this.snapshot

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private set(patch: Partial<FileServicesState>): void {
    this.snapshot = { ...this.snapshot, ...patch }
    for (const listener of this.listeners) listener()
  }

  setFiles(workspaceFiles: WorkspaceFilesFace): void {
    this.set({ workspaceFiles })
  }

  setOffice(officeToPdf: OfficeToPdfFace): void {
    this.set({ officeToPdf })
  }
}

export const fileServices = new FileServicesStore()

/** 插件 client 的最小 ctx 形状（与核心 connectHost 同款结构化子集）。 */
export interface FileHostContext {
  inject: (deps: string[], cb: (sub: unknown) => void) => void
}

/** 取一个宿主服务：dotted 注入值优先，退回 remote 上的同名属性；探针方法不在 ⇒ 判为没就位。 */
function pick<T>(sub: unknown, dotted: string, prop: string, probe: string): T | null {
  const rec = sub as Record<string, unknown>
  const remote = rec.remote as Record<string, unknown> | undefined
  const candidate = (rec[dotted] ?? remote?.[prop]) as T | undefined
  if (candidate === null || candidate === undefined) return null
  const probeValue = (candidate as unknown as Record<string, unknown>)[probe]
  return typeof probeValue === 'function' ? candidate : null
}

/** 把宿主文件服务接进 demo（client `apply` 里调**一次**）。 */
export function connectFileServices(ctx: FileHostContext): void {
  ctx.inject(['remote', 'remote.workspaceFiles'], (sub: unknown) => {
    const found = pick<WorkspaceFilesFace>(sub, 'remote.workspaceFiles', 'workspaceFiles', 'list')
    if (found !== null) fileServices.setFiles(found)
  })
  ctx.inject(['remote', 'remote.officeToPdf'], (sub: unknown) => {
    const found = pick<OfficeToPdfFace>(sub, 'remote.officeToPdf', 'officeToPdf', 'render')
    if (found !== null) fileServices.setOffice(found)
  })
}
