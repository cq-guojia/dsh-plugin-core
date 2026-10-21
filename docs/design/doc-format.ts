// 文档真源（.doc.ts）的类型 schema。改这里 = 改结构；tsconfig.docs.json 编译期校验。
export type Bilingual = { zh: string; en: string }

export type ApiRow = {
  name: string
  type: string
  def: string
  required?: string // 可选：「必填」列（是/否）
  desc: Bilingual
}

export type ApiTable = {
  id: string
  rows: ApiRow[]
}

export type CodeBlock = {
  id: string
  lang: string
  src: string
}

// section.id 必须全局唯一，且 1:1 对应 demo 的 SectionId（packages/demo/src/sections/index.tsx）。
// gen-docs 按 id 扁平聚合 docData[id]；重 id 直接报错退出。
export type Section = {
  id: string
  heading: Bilingual
  prose?: Bilingual[]
  api?: ApiTable[] // 一个 section 可有多张表，按数组顺序渲染
  code?: CodeBlock[]
}

export type DocTopic = {
  title: Bilingual
  topics?: string[]
  exports?: string[]
  display?: Record<string, Bilingual>
  sections: Section[]
}
