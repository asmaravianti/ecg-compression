const express = require('express');
const path = require('path');

// 简化版服务器启动脚本
const app = express();

// 基本中间件
app.use(express.static('.'));
app.use(express.json());

// 基本路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'ECG Compression Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 简单的端口检测函数
function startServer() {
    const portsToTry = [8080, 3001, 5000, 8000, 9000];

    function tryPort(port) {
        return new Promise((resolve, reject) => {
            const server = app.listen(port, () => {
                console.log(`✅ 服务器成功启动在端口 ${port}`);
                console.log(`🌐 访问地址: http://localhost:${port}/`);
                console.log(`👥 团队页面: http://localhost:${port}/team.html`);
                console.log(`🧪 快速测试: http://localhost:${port}/quick-test.html`);
                console.log(`📊 API状态: http://localhost:${port}/api-status.html`);
                resolve(server);
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`⚠️ 端口 ${port} 被占用`);
                    reject(err);
                } else {
                    console.error(`❌ 启动错误:`, err.message);
                    reject(err);
                }
            });
        });
    }

    // 依次尝试端口
    async function findPortAndStart() {
        for (const port of portsToTry) {
            try {
                console.log(`🔍 正在尝试端口 ${port}...`);
                await tryPort(port);
                return; // 成功启动，退出
            } catch (error) {
                if (error.code !== 'EADDRINUSE') {
                    console.error(`❌ 严重错误:`, error.message);
                    break;
                }
                // 继续尝试下一个端口
            }
        }
        console.error('❌ 所有端口都被占用，无法启动服务器');
        process.exit(1);
    }

    findPortAndStart();
}

console.log('🚀 正在启动ECG压缩平台...');
startServer();