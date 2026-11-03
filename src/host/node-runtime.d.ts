// 宿主侧只用到极小一片 Node 内建 API，但本包**不带 `@types/node`**（零运行时依赖的同一纪律：
// 宿主半边只做结构化声明，不把 Node 类型泄进公开 d.ts）。这里按用到的签名最小声明一份。
//
// 只用到了 `fs/promises` 的 lstat/stat/readdir/access/open、`path` 的四个函数、
// `Buffer.alloc` 与 `process.platform`；要加新调用就往下补，不要图省事整包引 @types/node。

declare module 'node:fs/promises' {
  export interface NodeStats {
    size: number
    isFile(): boolean
    isDirectory(): boolean
  }
  export interface NodeFileHandle {
    read(buffer: Uint8Array, offset: number, length: number, position: number): Promise<{ bytesRead: number }>
    close(): Promise<void>
  }
  export function lstat(path: string): Promise<NodeStats>
  export function stat(path: string): Promise<NodeStats>
  export function readdir(path: string): Promise<string[]>
  export function access(path: string): Promise<void>
  export function open(path: string, flags: string): Promise<NodeFileHandle>
}

declare module 'node:path' {
  export function isAbsolute(path: string): boolean
  export function normalize(path: string): string
  export function join(...parts: string[]): string
  export const sep: string
}

interface DshpcNodeBuffer extends Uint8Array {
  toString(encoding?: string): string
  includes(value: number): boolean
}

declare const Buffer: { alloc(size: number): DshpcNodeBuffer }
declare const process: { platform: string }
