# Docker 构建指南

## 问题诊断

你遇到的构建错误主要是由于 `canvas` 包需要本地编译，但 Alpine Linux 镜像缺少必要的构建工具。

### 原始错误分析
1. **Canvas 编译问题**: `canvas` 包需要 Python、make、g++ 等构建工具
2. **网络连接问题**: 基础镜像下载缓慢或失败
3. **平台兼容性**: 可能存在 ARM64/AMD64 平台差异

## 解决方案

### 方案一：使用提供的多阶段构建 Dockerfile

我们已经创建了一个优化的多阶段构建 Dockerfile：

```bash
# 使用构建脚本
./build-docker.sh

# 或者手动构建
docker build -t ssr-chart-server:latest .
```

### 方案二：配置 Docker 镜像加速器

如果网络连接有问题，配置国内镜像加速器：

**macOS Docker Desktop:**
1. 打开 Docker Desktop
2. 进入 Settings → Docker Engine
3. 添加以下配置：

```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://reg-mirror.qiniu.com"
  ]
}
```

### 方案三：本地构建后运行

如果 Docker 构建仍有问题，可以本地构建后运行：

```bash
# 本地构建
npm run build

# 本地运行
node dist/index.js
```

## Docker 运行命令

构建成功后，使用以下命令运行容器：

```bash
# 启动容器
docker run -d -p 3000:3000 --name chart-server ssr-chart-server:latest

# 查看日志
docker logs chart-server

# 停止容器
docker stop chart-server

# 删除容器
docker rm chart-server
```

## 测试接口

容器启动后，测试图表生成接口：

```bash
curl -X POST http://localhost:3000/api/generate-chart \
  -H "Content-Type: application/json" \
  -d '{"type": "line", "data": [{"time": 2018, "value": 91.9}, {"time": 2019, "value": 99.1}]}'
```

## 故障排除

### 1. Canvas 编译失败
确保 Dockerfile 中包含所有必要的构建依赖。

### 2. 网络超时
- 配置镜像加速器
- 使用代理
- 尝试不同时间段构建

### 3. 平台兼容性
如果遇到平台警告，可以指定平台：

```bash
docker build --platform linux/amd64 -t ssr-chart-server:latest .
```

### 4. 内存不足
增加 Docker 可用内存：
- Docker Desktop → Settings → Resources → Memory

## 生产部署建议

1. **使用多阶段构建**: 减小最终镜像大小
2. **健康检查**: 添加健康检查端点
3. **环境变量**: 配置端口、日志级别等
4. **持久化存储**: 挂载 public/image 目录
5. **安全性**: 使用非 root 用户运行

```bash
# 生产环境运行示例
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/public/image:/app/public/image \
  --name chart-server \
  --restart unless-stopped \
  ssr-chart-server:latest
``` 