// Form Validation
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('submissionForm')?.addEventListener('submit', (e) => {
      e.preventDefault();

    const files = {
        zip: document.getElementById('compressedFile').files[0],
        mat: document.getElementById('reconstructedFile').files[0]
    };

    if (!validateFiles(files)) {
        alert('Please upload valid .zip and .mat files');
        return;
    }

    alert('Submission received! Processing...');
});

function validateFiles(files) {
    const zipValid = files.zip?.name.endsWith('.zip');
    const matValid = files.mat?.name.endsWith('.mat');
    return zipValid && matValid;
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Forum Interaction
document.getElementById('forumContainer').innerHTML = `
    <div class="forum-post">
        <h3>Dataset Format Clarification</h3>
        <p>Posted by: User123 | 2 hours ago</p>
        <p>Can someone clarify the expected format for the reconstructed signals?</p>
        <button class="btn btn-primary">Reply</button>
    </div>
`;

// Submission History
document.getElementById('submissionHistory').innerHTML = `
    <div class="submission-card">
        <h3>Submission #1</h3>
        <p>Status: Processing</p>
        <p>Date: 2024-03-01</p>
        <p>CR: 45.2 | MSE: 0.0025</p>
    </div>
`;
// Team Management
let currentTeam = localStorage.getItem('currentTeam') || null;
let submissions = JSON.parse(localStorage.getItem('submissions')) || [];
let highScore = localStorage.getItem('highScore') || 0;

// Update team display
function updateTeamDisplay() {
    document.getElementById('currentTeam').textContent = currentTeam || 'Not Set';
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('totalSubmissions').textContent = submissions.length;
}

// Team Form Submission
document.getElementById('teamForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentTeam = document.getElementById('teamName').value;
    localStorage.setItem('currentTeam', currentTeam);
    updateTeamDisplay();
    alert('Team name saved!');
});

// Team Submission Handler
document.getElementById('teamSubmissionForm').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentTeam) {
        alert('Please set a team name first!');
        return;
    }

    const submission = {
        team: currentTeam,
        algorithm: document.getElementById('teamAlgorithm').value,
        file: document.getElementById('teamCompressedFile').files[0],
        date: new Date().toISOString(),
        // For demo purposes - real implementation would calculate from server response
        score: Math.random() * 100
    };

    submissions.push(submission);

    if (submission.score > highScore) {
        highScore = submission.score.toFixed(2);
        localStorage.setItem('highScore', highScore);
    }

    localStorage.setItem('submissions', JSON.stringify(submissions));
    updateTeamDisplay();
    updateLeaderboard();
    alert('Submission received! New high score: ' + highScore);
});

// Update Leaderboard
function updateLeaderboard() {
    const teams = submissions.reduce((acc, submission) => {
        if (!acc[submission.team] || submission.score > acc[submission.team]) {
            acc[submission.team] = submission.score;
        }
        return acc;
    }, {});

    const leaderboardBody = Object.entries(teams)
        .sort((a, b) => b[1] - a[1])
        .map(([team, score], index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${team}</td>
                <td>${score.toFixed(2)}</td>
            </tr>
        `).join('');

    document.querySelector('.leaderboard-table tbody').innerHTML = `
        <tr>
            <td>1</td>
            <td>${Object.keys(teams)[0] || 'SignalPros'}</td>
            <td>${highScore || '94.5'}</td>
        </tr>
        ${leaderboardBody}
    `;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateTeamDisplay();
    updateLeaderboard();
});

// 身份验证逻辑
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// 显示模态框
document.querySelectorAll('[href="#login"], [href="#register"], [href="#logout"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const formType = e.target.getAttribute('href').substring(1);

        if (formType === 'logout') {
            localStorage.removeItem('authToken');
            alert('Logged out!');
            updateAuthState();
            return;
        }

        authModal.style.display = 'block';
        showForm(formType);
    });
});


// 切换表单
document.querySelectorAll('.switch-form').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const formType = e.target.getAttribute('href').substring(1);
        showForm(formType);
    });
});

function showForm(formType) {
    loginForm.style.display = formType === 'login' ? 'block' : 'none';
    registerForm.style.display = formType === 'register' ? 'block' : 'none';
}

// 关闭模态框
document.querySelector('.close').addEventListener('click', () => {
    authModal.style.display = 'none';
});

// 注册表单提交
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const teamData = {
        teamName: document.getElementById('registerTeam').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teamData)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        alert('Registration successful! Please login.');
        showForm('login');
    } catch (error) {
        alert(`Registration failed: ${error.message}`);
    }
});

// 登录表单提交
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const credentials = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        localStorage.setItem('authToken', data.token);
        updateAuthState();
        authModal.style.display = 'none';

        // ✅ 登录成功后跳转
        window.location.href = 'team.html';

    } catch (error) {
        alert(`Login failed: ${error.message}`);
    }
});

// 更新认证状态
function updateAuthState() {
    const isLoggedIn = !!localStorage.getItem('authToken');
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.textContent = isLoggedIn ? 'Logout' : 'Login';
        authButton.setAttribute('href', isLoggedIn ? '#logout' : '#login');
    }
}

});