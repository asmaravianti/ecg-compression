# 🚀 ECG Compression Platform - 快速启动指南

## 问题解决方案

如果无法运行，请按照以下步骤操作：

### 方法1: 自动启动脚本 (推荐)

#### Windows用户:
```bash
# 双击运行任一脚本：
setup-and-start.bat     # 批处理脚本
setup-and-start.ps1     # PowerShell脚本
```

#### 或者在命令行中运行:
```bash
# 使用PowerShell
powershell -ExecutionPolicy Bypass -File setup-and-start.ps1

# 或使用命令提示符
setup-and-start.bat
```

### 方法2: 手动步骤

1. **检查Node.js安装**
   ```bash
   node --version
   npm --version
   ```
   如果没有安装，请从 https://nodejs.org/ 下载安装

2. **系统诊断**
   ```bash
   node diagnose.js
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动服务器**
   ```bash
   node start-server.js
   ```
   或者
   ```bash
   node server.js
   ```

### 方法3: 端口检测

如果服务器启动了但不知道端口，请：

1. 在浏览器中打开: `file:///E:/ModelingLab/ecg-compression/port-test.html`
2. 页面会自动检测服务器端口
3. 点击找到的链接访问应用

### 常见问题解决

#### 问题1: "node不是内部或外部命令"
**解决**: 安装Node.js - https://nodejs.org/

#### 问题2: 端口被占用
**解决**: 脚本会自动尝试3000-3009端口

#### 问题3: 依赖安装失败
**解决**:
```bash
npm cache clean --force
npm install
```

#### 问题4: 权限错误
**解决**: 以管理员身份运行命令提示符

### 验证安装

启动成功后，访问以下URL (端口可能不是3000):
- 主页: http://localhost:3000/index.html
- 团队页面: http://localhost:3000/team.html
- API测试: http://localhost:3000/api-test.html

### 端口自动检测

系统现在支持自动端口检测：
- 优先尝试端口3000
- 如果占用，自动尝试3001, 3002, 3003...
- 最多尝试10个端口

### 立即测试

最快的测试方法：
1. 双击 `setup-and-start.bat`
2. 等待自动安装和启动
3. 在浏览器中访问显示的URL

---

## 🔧 技术支持

如果仍然无法运行，请：
1. 运行 `node diagnose.js` 查看详细诊断信息
2. 检查终端输出的错误信息
3. 确保防火墙允许Node.js访问网络

**系统要求:**
- Node.js 14.0 或更高版本
- npm 6.0 或更高版本
- Windows 10/11 或 macOS/Linux

**已解决的问题:**
- ✅ 自动端口选择 (3000-3009)
- ✅ 进程清理和重启
- ✅ 依赖自动安装
- ✅ 真实ECG评分系统
- ✅ 动态API端点检测