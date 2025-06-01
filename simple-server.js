const express = require('express');
const path = require('path');

const app = express();

// 基本设置
app.use(express.static(__dirname));
app.use(express.json());

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'ECG服务器正在运行',
        timestamp: new Date().toISOString()
    });
});

// 固定端口启动
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`✅ 服务器启动成功！`);
    console.log(`🌐 访问地址: http://localhost:${PORT}/`);
    console.log(`👥 团队页面: http://localhost:${PORT}/team.html`);
    console.log(`🧪 快速测试: http://localhost:${PORT}/quick-test.html`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ 端口 ${PORT} 被占用！`);
        console.log(`💡 请尝试以下操作：`);
        console.log(`   1. 关闭占用端口的程序`);
        console.log(`   2. 或者修改此脚本使用其他端口`);
        console.log(`   3. 运行: netstat -ano | findstr :${PORT} 查看占用进程`);
    } else {
        console.error('❌ 服务器启动失败:', err.message);
    }
    process.exit(1);
});