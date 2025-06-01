// Global variables
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
let currentTeam = localStorage.getItem('currentTeam') || null;
let submissions = JSON.parse(localStorage.getItem('submissions')) || [];
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

// Token管理函数
function getAuthToken() {
    return localStorage.getItem('jwt_token') || localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('authToken', token); // 保持兼容性
}

function removeAuthToken() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('authToken');
}

// Utility functions
function validateFiles(files) {
    const zipValid = files.zip?.name.endsWith('.zip');
    const matValid = files.mat?.name.endsWith('.mat');
    return zipValid && matValid;
}

function updateTeamDisplay() {
    const currentTeamElem = document.getElementById('currentTeam');
    const highScoreElem = document.getElementById('highScore');
    const totalSubmissionsElem = document.getElementById('totalSubmissions');

    if (currentTeamElem) currentTeamElem.textContent = currentTeam || 'Not Set';
    if (highScoreElem) highScoreElem.textContent = highScore;
    if (totalSubmissionsElem) totalSubmissionsElem.textContent = submissions.length.toString();
}

function updateAuthState() {
    const isLoggedIn = !!getAuthToken();
    const authButton = document.getElementById('authButton');
    const currentTeamDisplay = document.getElementById('currentTeam');

    console.log('🔄 Updating auth state:', { isLoggedIn, hasTeam: !!currentTeam });

    if (authButton) {
        if (isLoggedIn) {
            authButton.textContent = 'Logout';
            authButton.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        } else {
            authButton.textContent = 'Login';
            authButton.onclick = function(e) {
                e.preventDefault();
                const modal = document.getElementById('authModal');
                if (modal) {
                    modal.style.display = 'block';
                    showForm('login');
                }
            };
        }
    }

    // 在团队页面检查认证状态
    if (window.location.pathname.includes('team.html') && !isLoggedIn) {
        console.log('⚠️ Not authenticated on team page, redirecting...');
        alert('Please login first!');
        window.location.href = 'index.html';
        return;
    }
}

async function updateLeaderboard() {
    console.log('📊 Fetching real leaderboard data...');
    const token = getAuthToken();
    if (!token) {
        console.log('⚠️ No auth token, showing default leaderboard');
        showDefaultLeaderboard();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Leaderboard fetch failed:', response.status, response.statusText);
            if (response.status === 401 || response.status === 403) {
                console.log('⚠️ Token invalid during fetch, clearing');
                removeAuthToken();
                updateAuthState();
                showDefaultLeaderboard();
                return;
            }
        }

        const data = await response.json();
        console.log('📊 Leaderboard data received:', data);

        // Update leaderboard table
        const leaderboardTable = document.querySelector('.leaderboard-table tbody');
        if (leaderboardTable) {
            if (!data.results || data.results.length === 0) {
                showDefaultLeaderboard();
            } else {
                const leaderboardBody = data.results.map((entry, index) => `
                    <tr ${entry.participant_name === (currentTeam || '') ? 'class="current-team"' : ''}>
                        <td>${index + 1}</td>
                        <td>${entry.participant_name || 'Unknown'}</td>
                        <td>${entry.scores?.CR || 'N/A'}</td>
                        <td>${entry.scores?.PRD || 'N/A'}</td>
                        <td>${entry.scores?.Score || 'N/A'}</td>
                    </tr>
                `).join('');

                leaderboardTable.innerHTML = leaderboardBody;
            }
        }
    } catch (error) {
        console.error('❌ Leaderboard fetch error:', error);
        showDefaultLeaderboard();
    }
}

function showDefaultLeaderboard() {
    const leaderboardTable = document.querySelector('.leaderboard-table tbody');
    if (leaderboardTable) {
        leaderboardTable.innerHTML = `
            <tr>
                <td>1</td>
                <td>SignalPros</td>
                <td>48.2</td>
                <td>0.0021</td>
                <td>94.5</td>
            </tr>
            <tr>
                <td>2</td>
                <td>DataMasters</td>
                <td>42.1</td>
                <td>0.0031</td>
                <td>89.2</td>
            </tr>
            <tr>
                <td>3</td>
                <td>${currentTeam || 'Your Team'}</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
            </tr>
        `;
    }
}

// 保存团队名称
async function saveTeamName() {
    const teamNameInput = document.getElementById('teamName');
    if (!teamNameInput) return;

    const teamName = teamNameInput.value.trim();
    if (!teamName) {
        alert('Please enter team name!');
        return;
    }

    try {
        currentTeam = teamName;
        localStorage.setItem('currentTeam', teamName);
        updateTeamDisplay();
        updateLeaderboard();
        alert('Team name saved successfully!');
        console.log('✅ Team name saved:', teamName);
    } catch (error) {
        console.error('❌ Error saving team name:', error);
        alert('Failed to save team name!');
    }
}

async function checkSubmissionStatus(submissionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/submission-status/${submissionId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Status check failed');
        }

        const data = await response.json();
        console.log('📊 Submission status:', data);
        return data;
    } catch (error) {
        console.error('❌ Status check error:', error);
        return null;
    }
}

async function testCodabenchConnection() {
    try {
        console.log('🔌 Testing Codabench connection...');
        const response = await fetch(`${API_BASE_URL}/test-codabench`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Successfully connected to Codabench API:', data);
            alert('✅ Codabench connection successful! Check console for details.');
        } else {
            console.error('❌ Failed to connect to Codabench API:', data);
            alert(`❌ Codabench connection failed: ${data.message}`);
        }

        return data;
    } catch (error) {
        console.error('❌ Error testing Codabench connection:', error);
        alert(`❌ Connection error: ${error.message}`);
        throw error;
    }
}

function showForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.style.display = formType === 'login' ? 'block' : 'none';
    if (registerForm) registerForm.style.display = formType === 'register' ? 'block' : 'none';
}

// 文件上传和提交功能
async function submitFiles() {
    const algorithmNameInput = document.getElementById('teamAlgorithm');
    const fileInput = document.getElementById('teamCompressedFile');

    if (!algorithmNameInput || !fileInput) {
        alert('Page elements not found!');
        return;
    }

    const algorithmName = algorithmNameInput.value.trim();
    const file = fileInput.files[0];

    if (!algorithmName) {
        alert('Please enter algorithm name!');
        return;
    }

    if (!file) {
        alert('Please select a file to upload!');
        return;
    }

    if (!currentTeam) {
        alert('Please set team name first!');
        return;
    }

    try {
        console.log('🚀 Starting file submission...', { algorithmName, fileName: file.name, teamName: currentTeam });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('algorithmName', algorithmName);
        formData.append('teamName', currentTeam);

        const response = await fetch(`${API_BASE_URL}/submit-to-codabench`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });

        const data = await response.json();
        console.log('📊 Submission response:', data);

        if (response.ok && data.success) {
            alert(`✅ Submission successful!\n\nAlgorithm: ${algorithmName}\nTeam: ${currentTeam}\nStatus: ${data.status}\n\nCheck console for detailed scoring information.`);

            // 更新提交列表
            const newSubmission = {
                id: data.submissionId,
                teamName: currentTeam,
                algorithmName: algorithmName,
                status: data.status,
                scores: data.scores || data.datasetScores,
                timestamp: new Date().toISOString()
            };

            submissions.unshift(newSubmission);
            localStorage.setItem('submissions', JSON.stringify(submissions));

            // 更新最高分
            if (data.scores && data.scores.Score) {
                const newScore = parseFloat(data.scores.Score);
                if (newScore > highScore) {
                    highScore = newScore;
                    localStorage.setItem('highScore', highScore.toString());
                }
            }

            updateTeamDisplay();
            updateSubmissionsDisplay();
            updateLeaderboard();

            // 清空表单
            algorithmNameInput.value = '';
            fileInput.value = '';

        } else {
            throw new Error(data.message || data.error || 'Submission failed');
        }

    } catch (error) {
        console.error('❌ Submission error:', error);
        alert(`❌ Submission failed: ${error.message}`);
    }
}

function updateSubmissionsDisplay() {
    const submissionsContainer = document.getElementById('submissionHistory');
    if (!submissionsContainer) return;

    if (submissions.length === 0) {
        submissionsContainer.innerHTML = '<p>No submission history</p>';
        return;
    }

    const submissionsHTML = submissions.map((submission, index) => `
        <div class="submission-item">
            <h4>${submission.algorithmName}</h4>
            <p>Team: ${submission.teamName}</p>
            <p>Status: <span class="status-${submission.status}">${submission.status}</span></p>
            <p>Time: ${new Date(submission.timestamp).toLocaleString()}</p>
            ${submission.scores ? `
                <div class="scores">
                    <p>Compression Ratio (CR): ${submission.scores.CR || 'N/A'}</p>
                    <p>PRD: ${submission.scores.PRD || 'N/A'}</p>
                    <p>Quality Score (QS): ${submission.scores.Score || 'N/A'}</p>
                </div>
            ` : ''}
        </div>
    `).join('');

    submissionsContainer.innerHTML = submissionsHTML;
}

function addSubmission(teamName, algorithmName, score) {
    const submission = {
        id: Date.now(),
        teamName,
        algorithmName,
        score,
        timestamp: new Date().toISOString()
    };

    submissions.unshift(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    updateSubmissionsDisplay();
}

async function register(teamName, email, password) {
    try {
        console.log('📝 Registering user:', { teamName, email });

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamName, email, password }),
        });

        const data = await response.json();
        console.log('📝 Register response:', data);

        if (response.ok && data.success) {
            alert('Registration successful! Please login.');
            showForm('login');
            // 清空注册表单
            document.getElementById('registerTeam').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            // 预填团队名到登录表单
            document.getElementById('loginTeam').value = teamName;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        alert(`Registration failed: ${error.message}`);
    }
}

async function login(teamName, password) {
    try {
        console.log('🔐 Logging in user:', teamName);

        if (!teamName || !password) {
            alert('Please enter both team name and password');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamName, password }),
        });

        const data = await response.json();
        console.log('🔐 Login response:', data);

        if (response.ok && data.success) {
            setAuthToken(data.token);
            currentTeam = teamName;
            localStorage.setItem('currentTeam', teamName);

            // 关闭模态框
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'none';
            }

            alert('Login successful!');
            window.location.href = 'team.html';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        alert(`Login failed: ${error.message}`);
    }
}

function logout() {
    removeAuthToken();
    currentTeam = null;
    localStorage.removeItem('currentTeam');
    submissions = [];
    localStorage.removeItem('submissions');
    highScore = 0;
    localStorage.removeItem('highScore');

    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

function setupEventListeners() {
    // 登录按钮点击事件 - 显示模态框
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'block';
                showForm('login'); // 默认显示登录表单
            }
        });
    }

    // 模态框关闭按钮
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 点击模态框背景关闭
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 注册表单
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const teamName = document.getElementById('registerTeam').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            register(teamName, email, password);
        });
    }

    // 登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const teamName = document.getElementById('loginTeam').value;
            const password = document.getElementById('loginPassword').value;
            login(teamName, password);
        });
    }

    // 团队表单 - 更新为正确的表单ID
    const teamForm = document.getElementById('teamForm');
    if (teamForm) {
        teamForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTeamName();
        });
    }

    // 团队提交表单 - 更新为正确的表单ID
    const teamSubmissionForm = document.getElementById('teamSubmissionForm');
    if (teamSubmissionForm) {
        teamSubmissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitFiles();
        });
    }

    // Codabench测试按钮
    const testButton = document.getElementById('testCodabenchButton');
    if (testButton) {
        testButton.addEventListener('click', testCodabenchConnection);
    }

    // 表单切换按钮
    const switchForms = document.querySelectorAll('.switch-form');
    switchForms.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#register') {
                showForm('register');
            } else if (href === '#login') {
                showForm('login');
            }
        });
    });

    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // 清除缓存按钮
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all cached data?')) {
                localStorage.clear();
                alert('Cache cleared! Page will reload.');
                window.location.reload();
            }
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ECG Compression Platform loaded');
    console.log('🔐 Current auth token:', getAuthToken() ? 'Present' : 'Not found');
    console.log('👥 Current team:', currentTeam);

    setupEventListeners();
    updateAuthState();
    updateTeamDisplay();
    updateSubmissionsDisplay();
    updateLeaderboard();

    // 如果在团队页面且已登录，检查认证状态
    if (window.location.pathname.includes('team.html')) {
        if (!getAuthToken()) {
            alert('请先登录！');
            window.location.href = 'index.html';
        }
    }
});

