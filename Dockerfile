# 使用官方的Node.js镜像作为基础镜像
FROM node:16

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 编译TypeScript代码（如果有）
RUN npm run build

# 暴露应用运行的端口
EXPOSE 8080

# 启动应用
CMD ["npm", "run", "serve"]