// 图表输入类型定义
export type ChartInput = {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'
  title?: string
  labels?: string[]
  data: any[]
  width?: number
  height?: number
  host?: string // 添加host选项，用于构建完整URL
}

// 图表输出类型定义
export type ChartOutput = {
  content:
    | [
        {
          type: 'text'
          text: string
        }
      ]
    | [
        {
          type: 'image'
          data: string // 图片数据
          mimeType: string
          imageUrl: string // 完整的图片URL
        }
      ]
  isError?: boolean
}
