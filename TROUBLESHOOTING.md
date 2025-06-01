# 🔧 ECG压缩平台启动故障排除指南

## 🚨 当前问题：服务器无法启动

### 问题描述
服务器在尝试端口时出现错误，端口号变成无效值（如 "300011"）。

## 💡 解决方案

### 方案1：使用简化服务器（推荐）

1. **启动简化服务器**：
   ```bash
   node simple-server.js
   ```

   如果成功，您会看到：
   ```
   ✅ 服务器启动成功！
   🌐 访问地址: http://localhost:8080/
   ```

2. **访问测试页面**：
   - 主页：`http://localhost:8080/`
   - 团队页面：`http://localhost:8080/team.html`
   - 快速测试：`http://localhost:8080/quick-test.html`

### 方案2：检查并清理端口占用

1. **查看端口占用**：
   ```bash
   netstat -ano | findstr ":3000\|:8080\|:30001"
   ```

2. **如果有进程占用端口，记下PID并终止**：
   ```bash
   taskkill /PID [PID号码] /F
   ```

3. **或者终止所有Node.js进程**：
   ```bash
   taskkill /F /IM node.exe
   ```

### 方案3：使用不同端口

如果8080端口被占用，修改 `simple-server.js` 中的端口号：

```javascript
const PORT = 9000; // 改为其他端口
```

### 方案4：修复原始服务器

如果要使用完整功能的 `server.js`：

1. **先确保没有其他Node进程运行**：
   ```bash
   taskkill /F /IM node.exe
   ```

2. **等待几秒钟**，然后启动：
   ```bash
   node server.js
   ```

## 🧪 测试步骤

### 1. 基本连接测试
```bash
curl http://localhost:8080/api/health
```
或在浏览器中访问：`http://localhost:8080/api/health`

### 2. 快速功能测试
访问：`http://localhost:8080/quick-test.html`
- 点击 "Test Server Health" 应该显示成功

### 3. 完整功能测试
1. 访问主页：`http://localhost:8080/`
2. 注册新用户
3. 登录后访问团队页面
4. 测试团队名称保存功能

## 📋 常见错误及解决方法

### 错误1：`EADDRINUSE` - 端口被占用
**解决**：
- 终止占用进程或使用其他端口
- 等待几秒钟让端口完全释放

### 错误2：`ERR_SOCKET_BAD_PORT` - 无效端口号
**解决**：
- 使用修复后的服务器代码
- 确保端口号是有效的数字（1-65535）

### 错误3：模块未找到
**解决**：
```bash
npm install express multer bcryptjs jsonwebtoken
```

### 错误4：权限问题
**解决**：
- 以管理员身份运行命令提示符
- 或使用端口号 > 1024

## 🎯 推荐启动顺序

1. **第一次启动**：
   ```bash
   node simple-server.js
   ```

2. **确认基本功能正常后**，停止简化服务器（Ctrl+C）

3. **启动完整服务器**：
   ```bash
   node server.js
   ```

## 🔍 调试信息收集

如果问题仍然存在，请收集以下信息：

1. **系统信息**：
   ```bash
   node --version
   npm --version
   ```

2. **端口占用情况**：
   ```bash
   netstat -ano | findstr LISTENING
   ```

3. **当前目录文件**：
   ```bash
   dir *.js
   ```

4. **错误日志**：复制完整的错误信息

## 🎉 成功标志

当服务器正确启动时，您应该看到：

```
✅ 服务器启动成功！
🌐 访问地址: http://localhost:8080/
👥 团队页面: http://localhost:8080/team.html
🧪 快速测试: http://localhost:8080/quick-test.html
🏥 健康检查: http://localhost:8080/api/health
```

访问任何提供的URL都应该正常工作。

---

**如果以上所有方法都不起作用，请提供错误信息的截图或完整错误日志。**