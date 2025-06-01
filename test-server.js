const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// In-memory storage for now
let users = [
    {
        teamName: 'DebugDivas',
        email: 'xujessie959@gmail.com',
        password: '123456',
        registeredAt: new Date().toISOString()
    },
    {
        teamName: 'TestTeam2025',
        email: 'test@example.com',
        password: '123456',
        registeredAt: new Date().toISOString()
    },
    {
        teamName: 'QuickTestUser',
        email: 'quicktest@example.com',
        password: '123456',
        registeredAt: new Date().toISOString()
    }
];

// Debug endpoint
app.get('/api/debug-users', (req, res) => {
    res.json({
        success: true,
        message: 'Server is working!',
        totalUsers: users.length,
        users: users.map(u => ({ teamName: u.teamName, email: u.email }))
    });
});

// Registration endpoint
app.post('/api/register', (req, res) => {
    console.log('Registration request:', req.body);

    const { teamName, email, password } = req.body;

    if (!teamName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Email already registered'
        });
    }

    // Add new user
    const newUser = {
        teamName,
        email,
        password,
        registeredAt: new Date().toISOString()
    };

    users.push(newUser);

    console.log(`User registered: ${teamName} (${email})`);

    res.json({
        success: true,
        message: 'Registration successful',
        teamName: teamName
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    console.log('Login request:', req.body);

    // Support both field names for compatibility
    const { teamName, team_name, password } = req.body;
    const loginTeamName = teamName || team_name;

    if (!loginTeamName || !password) {
        return res.status(400).json({
            success: false,
            message: 'Team name and password are required'
        });
    }

    const user = users.find(u => u.teamName === loginTeamName && u.password === password);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    res.json({
        success: true,
        message: 'Login successful',
        token: `jwt_${user.teamName}_${Date.now()}`,
        teamName: user.teamName
    });
});

// Leaderboard endpoint (required for team page)
app.get('/api/leaderboard', (req, res) => {
    console.log('Leaderboard request');

    // Mock leaderboard data
    const mockLeaderboard = [
        {
            participant_name: 'DebugDivas',
            scores: { CR: 48.2, PRD: 0.0021, Score: 94.5 }
        },
        {
            participant_name: 'TestTeam2025',
            scores: { CR: 45.7, PRD: 0.0028, Score: 91.2 }
        },
        {
            participant_name: 'QuickTestUser',
            scores: { CR: 42.1, PRD: 0.0035, Score: 87.8 }
        },
        {
            participant_name: 'SignalPros',
            scores: { CR: 50.3, PRD: 0.0019, Score: 96.1 }
        },
        {
            participant_name: 'ECGMasters',
            scores: { CR: 44.8, PRD: 0.0031, Score: 89.4 }
        }
    ];

    res.json({
        success: true,
        results: mockLeaderboard
    });
});

// Upload endpoint (for file submissions)
app.post('/api/upload', (req, res) => {
    console.log('Upload request');
    res.json({
        success: true,
        filePath: '/uploads/mock-file.zip',
        message: 'File uploaded successfully'
    });
});

// Submit to codabench endpoint
app.post('/api/submit-to-codabench', (req, res) => {
    console.log('Submit to codabench request:', req.body);

    const mockSubmissionId = `sub_${Date.now()}`;

    res.json({
        success: true,
        submissionId: mockSubmissionId,
        status: 'submitted',
        message: 'Submission successful (mock)',
        scores: {
            CR: Math.random() * 30 + 30,
            PRD: Math.random() * 0.005 + 0.001,
            Score: Math.random() * 50 + 40
        }
    });
});

// Submission status endpoint
app.get('/api/submission-status/:submissionId', (req, res) => {
    const { submissionId } = req.params;

    res.json({
        id: submissionId,
        status: 'Finished',
        scores: {
            CR: Math.random() * 30 + 30,
            PRD: Math.random() * 0.005 + 0.001,
            Score: Math.random() * 50 + 40
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`📊 Quick test page: http://localhost:${PORT}/quick-test.html`);
    console.log(`🏠 Main site: http://localhost:${PORT}/index.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...');
    process.exit(0);
});