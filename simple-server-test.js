const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Test endpoint
app.get('/api/debug-users', (req, res) => {
    res.json({
        totalUsers: 0,
        users: [],
        message: 'Server is working!'
    });
});

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { teamName, email, password } = req.body;

    console.log('Registration request:', { teamName, email, hasPassword: !!password });

    if (!teamName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    // Simple success response
    res.json({
        success: true,
        message: 'Registration successful'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple test server running on http://localhost:${PORT}`);
    console.log(`📋 Debug endpoint: http://localhost:${PORT}/api/debug-users`);
    console.log(`📝 Register endpoint: http://localhost:${PORT}/api/register`);
});

process.on('SIGINT', () => {
    console.log('\n👋 Server shutting down...');
    process.exit();
});