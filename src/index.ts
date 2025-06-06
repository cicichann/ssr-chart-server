import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { ChartInput, ChartOutput } from './types.js'
import { renderChart } from './chart-renderer.js'

// 获取当前目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 定义端口
const PORT = 3000

// 创建Express应用
const app = express()

// 配置CORS，允许所有来源访问
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  })
)

// 增加响应超时和请求体大小限制
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static(path.join(__dirname, '../public')))

// 对外提供的图表生成接口
app.post(
  '/api/generate-chart',
  express.json({ limit: '50mb' }),
  async (req: any, res: any) => {
    try {
      const chartData = req.body as ChartInput

      // 获取请求域名和端口，构建完整URL
      const protocol = req.protocol
      const host = req.get('host')
      chartData.host = `${protocol}://${host}`

      // 验证必需字段
      if (!chartData.type || !chartData.data) {
        res.status(400).json({
          error: '缺少必要的图表数据。必须提供type和data字段。'
        })
        return
      }

      // 使用包装模块渲染图表
      const vis = await renderChart(chartData)

      if (!vis || typeof vis.toBuffer !== 'function') {
        res.status(500).json({
          error: '图表渲染失败',
          message: '渲染函数返回格式不正确'
        })
        return
      }

      const imageBuffer = vis.toBuffer()

      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        res.status(500).json({
          error: '图表渲染失败',
          message: '无法生成图片缓冲区'
        })
        return
      }

      console.log('图表生成成功，缓冲区大小:', imageBuffer.length)

      // 生成唯一的文件名
      const timestamp = Date.now()
      const filename = `chart_${timestamp}.png`
      const filepath = path.join(__dirname, '../public/image', filename)

      // 确保目录存在
      const imageDir = path.dirname(filepath)
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true })
      }

      // 将图片保存到文件系统
      fs.writeFileSync(filepath, imageBuffer)

      // 构建图片访问URL
      const imageUrl = `${protocol}://${host}/chart-app/image/${filename}`

      res.status(200).json({
        success: true,
        mimeType: 'image/png',
        imageUrl: imageUrl,
        filename: filename,
        size: imageBuffer.length
      })
    } catch (error) {
      console.error('生成图表时出错', error)
      res.status(500).json({
        error: '生成图表时发生服务器错误',
        message: error instanceof Error ? error.message : String(error)
      })
      return
    }
  }
)

// 启动服务器
app.listen(PORT, () => {
  console.info(`MCP图表服务器已启动`, {
    port: PORT
  })
  console.info(`直接图表生成端点：http://localhost:${PORT}/api/generate-chart`)
})
