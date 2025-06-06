const { render } = require('@antv/gpt-vis-ssr')

async function testRender() {
  try {
    const options = {
      type: 'line',
      data: [
        { time: 2018, value: 91.9 },
        { time: 2019, value: 99.1 },
        { time: 2020, value: 101.6 },
        { time: 2021, value: 114.4 },
        { time: 2022, value: 121 }
      ]
    }

    console.log('调用 render 函数...')
    const result = await render(options)
    console.log('render 函数返回:', typeof result, result)

    if (result && typeof result.toBuffer === 'function') {
      const buffer = result.toBuffer()
      console.log('toBuffer 返回:', typeof buffer, buffer)
    } else {
      console.log('result 不包含 toBuffer 方法')
    }
  } catch (error) {
    console.error('错误:', error)
  }
}

testRender()
