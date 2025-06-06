# 构建阶段
FROM --platform=linux/amd64 harbor.trscd.com.cn/baseapp/node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    pkgconfig

ENV PYTHON=/usr/bin/python3

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 设置npm镜像源并安装依赖
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install

# 修复 @antv/gpt-vis-ssr 模块系统配置
RUN sed -i 's/"type": "module"/"type": "commonjs"/g' node_modules/@antv/gpt-vis-ssr/package.json || true

# 复制源代码并构建
COPY src ./src
COPY tsconfig.json ./

# 构建项目
RUN npm run build

# 生产阶段
FROM --platform=linux/amd64 harbor.trscd.com.cn/baseapp/node:18-alpine AS production

# 安装运行时依赖和字体支持
RUN apk add --no-cache \
    fontconfig \
    tzdata \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype \
    ttf-dejavu \
    font-noto \
    font-noto-cjk \
    wqy-zenhei

# 创建字体目录并更新字体缓存
RUN mkdir -p /usr/share/fonts/truetype && \
    fc-cache -fv

# 设置环境变量
ENV TZ=Asia/Shanghai
ENV LANG=zh_CN.UTF-8
ENV LC_ALL=zh_CN.UTF-8
ENV NODE_ENV=production
ENV FONTCONFIG_PATH=/etc/fonts

WORKDIR /app

# 从构建阶段复制所有node_modules（包括已编译的canvas）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 从构建阶段复制构建后的文件
COPY --from=builder /app/dist ./dist
COPY public ./public

EXPOSE 3000

# 启动应用
CMD ["node", "dist/index.js"]
