import { createRequire } from 'module'

// 创建 require 函数来导入 CommonJS 模块
const require = createRequire(import.meta.url)

// 直接从 CJS 入口点导入
const gptVisSSR = require('@antv/gpt-vis-ssr/dist/cjs/index.js')

export async function renderChart(options: any) {
  try {
    return await gptVisSSR.render(options)
  } catch (error) {
    console.error('Chart rendering error:', error)
    throw error
  }
}
