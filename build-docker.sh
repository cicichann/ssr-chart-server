#!/bin/bash

echo "开始构建 ssr-chart-server Docker 镜像..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker 未运行，请先启动 Docker"
    exit 1
fi

# 尝试不同的镜像源
echo "尝试使用阿里云镜像源构建..."
docker build -t ssr-chart-server:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker 镜像构建成功!"
    echo "📋 镜像信息:"
    docker images | grep ssr-chart-server
    echo ""
    echo "🚀 启动容器命令:"
    echo "docker run -d -p 3000:3000 --name chart-server ssr-chart-server:latest"
    echo ""
    echo "🔍 查看容器日志:"
    echo "docker logs chart-server"
else
    echo "❌ 构建失败，请检查网络连接或依赖问题"
    echo ""
    echo "🔧 解决方案:"
    echo "1. 检查网络连接"
    echo "2. 配置Docker镜像加速器"
    echo "3. 或者手动构建："
    echo "   docker build --no-cache -t ssr-chart-server:latest ."
    exit 1
fi 