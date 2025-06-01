# ECG Compression Benchmark Platform

这是一个用于ECG压缩算法评估的Web平台，支持与Codabench API集成。

## 功能特性

- 🔐 用户注册和登录系统
- 📊 实时排行榜显示
- 📁 算法文件上传和提交
- 🔗 Codabench API集成
- 📈 本地评分系统（作为备用）
- 🧪 API测试工具

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

确保`.env`文件包含正确的配置：

```env
# Server configuration
PORT=3000
JWT_SECRET=your-secret-key

# Codabench API configuration
CODABENCH_USERNAME=your-username
CODABENCH_PASSWORD=your-password
CODABENCH_API_URL=https://www.codabench.org/api
CODABENCH_COMPETITION_ID=5899
CODABENCH_SECRET_KEY=your-secret-key

# File upload configuration
MAX_FILE_SIZE=50000000
UPLOAD_DIR=./uploads
```

### 3. 启动服务器

```bash
# 方式1: 直接启动
npm start

# 方式2: 使用启动脚本
node start-server.js

# 方式3: 开发模式
npm run dev
```

### 4. 访问应用

- 主页: http://localhost:3000/index.html
- 团队页面: http://localhost:3000/team.html
- API测试: http://localhost:3000/api-test.html

## API端点

### 认证相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录

### 竞赛相关
- `GET /api/leaderboard` - 获取排行榜
- `POST /api/submit-to-codabench` - 提交算法
- `GET /api/submission-status/:id` - 查询提交状态

### Codabench集成
- `GET /api/test-codabench` - 测试Codabench连接
- `GET /api/check-available-endpoints` - 检查可用端点

### 调试工具
- `GET /api/debug-info` - 获取调试信息
- `GET /api/debug-uploads` - 查看上传文件

## 使用流程

1. **注册账户**: 在主页点击"Register"创建账户
2. **登录系统**: 使用注册的凭据登录
3. **访问团队页面**: 登录后可访问team.html页面
4. **上传算法**: 在团队页面上传.zip格式的算法文件
5. **查看结果**: 在排行榜中查看评分结果

## 故障排除

### 常见问题

1. **404错误 - API端点不可用**
   - 确保服务器正在运行
   - 检查端口3000是否被占用
   - 验证API_BASE_URL设置正确

2. **认证失败**
   - 检查JWT token是否有效
   - 确认登录状态
   - 清除浏览器localStorage重新登录

3. **Codabench连接失败**
   - 验证.env文件中的Codabench凭据
   - 检查网络连接
   - 使用API测试页面诊断问题

### 调试步骤

1. 访问 http://localhost:3000/api-test.html
2. 依次测试各个API端点
3. 查看浏览器控制台错误信息
4. 检查服务器日志输出

## 开发说明

### 项目结构

```
ecg-compression/
├── server.js          # 主服务器文件
├── scripts.js         # 前端JavaScript
├── styles.css         # 样式文件
├── index.html         # 主页
├── team.html          # 团队页面
├── api-test.html      # API测试页面
├── .env               # 环境变量
├── package.json       # 项目配置
└── uploads/           # 上传文件目录
```

### 技术栈

- **后端**: Node.js + Express
- **认证**: JWT
- **文件上传**: Multer
- **API集成**: Axios
- **前端**: 原生HTML/CSS/JavaScript

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License