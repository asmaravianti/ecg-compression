const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));
// 临时数据库
const teams = [];

// 首页路由（修复 "Cannot GET /"）
app.get("/", (req, res) => {
    res.send("Welcome to my API! Use /api/register to register and /api/login to log in.");
});

// 注册端点
app.post('/api/register', async (req, res) => {
    try {
        const { teamName, email, password } = req.body;

        // 验证输入
        if (!teamName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 检查是否已存在
        if (teams.some(t => t.email === email)) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 保存团队
        teams.push({
            teamName,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 登录端点
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const team = teams.find(t => t.email === email);

        if (!team || !await bcrypt.compare(password, team.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 生成JWT
        const token = jwt.sign(
            { email: team.email },
            'your_secret_key',
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 启动服务器
app.listen(3000, () => console.log('Server running on port 3000'));
