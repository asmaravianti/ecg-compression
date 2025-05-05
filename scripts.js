// Form Validation
document.addEventListener("DOMContentLoaded", () => {
    // Form validation
    document.getElementById('submissionForm')?.addEventListener('submit', (e) => {
      e.preventDefault();

    const files = {
          zip: document.getElementById('compressedFile')?.files[0],
          mat: document.getElementById('reconstructedFile')?.files[0]
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
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
            behavior: 'smooth'
        });
            }
    });
});

// Forum Interaction
    const forumContainer = document.getElementById('forumContainer');
    if (forumContainer) {
        forumContainer.innerHTML = `
    <div class="forum-post">
        <h3>Dataset Format Clarification</h3>
        <p>Posted by: User123 | 2 hours ago</p>
        <p>Can someone clarify the expected format for the reconstructed signals?</p>
        <button class="btn btn-primary">Reply</button>
    </div>
`;
    }

    // Submission History initial setup
    const submissionHistoryElement = document.getElementById('submissionHistory');
    if (submissionHistoryElement && submissionHistoryElement.children.length === 0) {
        // Only set default content if there's no dynamic content yet
        submissionHistoryElement.innerHTML = `
    <div class="submission-card">
        <h3>Submission #1</h3>
        <p>Status: Processing</p>
        <p>Date: 2024-03-01</p>
                <p>CR: 45.2 | PRD: 0.0025</p>
    </div>
`;
    }

// Team Management
let currentTeam = localStorage.getItem('currentTeam') || null;
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
let highScore = localStorage.getItem('highScore') || 0;

// Update team display
function updateTeamDisplay() {
        const currentTeamElem = document.getElementById('currentTeam');
        const highScoreElem = document.getElementById('highScore');
        const totalSubmissionsElem = document.getElementById('totalSubmissions');

        if (currentTeamElem) currentTeamElem.textContent = currentTeam || 'Not Set';
        if (highScoreElem) highScoreElem.textContent = highScore;
        if (totalSubmissionsElem) totalSubmissionsElem.textContent = submissions.length.toString();
}

// Team Form Submission
    document.getElementById('teamForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
        const teamNameInput = document.getElementById('teamName');
        if (teamNameInput) {
            currentTeam = teamNameInput.value;
    localStorage.setItem('currentTeam', currentTeam);
    updateTeamDisplay();
    alert('Team name saved!');
        }
});

    // Team Submission Handler - single implementation
    document.getElementById('teamSubmissionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

        if (!localStorage.getItem('authToken')) {
            alert('Please log in to submit an algorithm');
            return;
        }

    if (!currentTeam) {
        alert('Please set a team name first!');
        return;
    }

        const algorithmName = document.getElementById('teamAlgorithm').value;
        const file = document.getElementById('teamCompressedFile').files[0];

        if (!file || !file.name.endsWith('.zip')) {
            alert('Please upload a valid .zip file');
            return;
        }

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('teamName', currentTeam);
            formData.append('algorithmName', algorithmName);
            formData.append('file', file);

            console.log('Uploading file:', file.name, 'Size:', file.size);

            // First upload to your server
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(`File upload failed: ${errorData.message || uploadResponse.statusText}`);
            }

            const uploadResult = await uploadResponse.json();
            console.log('Upload successful, file path:', uploadResult.filePath);

            // Now submit to Codabench
            const submissionResponse = await fetch('/api/submit-to-codabench', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    teamName: currentTeam,
                    algorithmName: algorithmName,
                    filePath: uploadResult.filePath
                })
            });

            // 先记录响应状态和原始内容
            console.log('Submission response status:', submissionResponse.status);
            const responseText = await submissionResponse.text();
            console.log('Submission response text:', responseText);

            // 尝试解析JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(`Failed to parse response: ${responseText}`);
            }

            if (!submissionResponse.ok) {
                throw new Error(data.message || data.error || 'Submission failed');
            }

            // 提交成功处理
    const submission = {
                id: data.submissionId || `local-${Date.now()}`,
        team: currentTeam,
                algorithm: algorithmName,
        date: new Date().toISOString(),
                status: data.status === 'error-but-recorded' ? 'Pending (Offline)' : 'Processing',
                file: file.name
    };

            // 保存到本地存储
    submissions.push(submission);
            localStorage.setItem('submissions', JSON.stringify(submissions));

            // 创建新的提交卡片
            const historyContainer = document.getElementById('submissionHistory');
            if (historyContainer) {
                const card = document.createElement('div');
                card.className = 'submission-card';
                card.id = `submission-${submission.id}`;
                card.innerHTML = `
                    <h3>${submission.algorithm}</h3>
                    <p>Status: ${submission.status}</p>
                    <p>Date: ${new Date(submission.date).toLocaleDateString()}</p>
                    <p>File: ${submission.file}</p>
                    ${data.status === 'error-but-recorded' ?
                      '<p class="warning">Note: Submission stored locally only</p>' : ''}
                `;
                historyContainer.prepend(card);
            }

            // 更新显示
    updateTeamDisplay();

            alert(data.status === 'error-but-recorded' ?
                  'Submission stored locally (Codabench connection issue)' :
                  'Submission received! Processing has begun.');

            // 重置表单
            document.getElementById('teamSubmissionForm').reset();
        } catch (error) {
            console.error('Submission error:', error);
            alert(`Submission failed: ${error.message}`);
        } finally {
            // 恢复按钮状态
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
});

// Update Leaderboard
function updateLeaderboard() {
    const teams = submissions.reduce((acc, submission) => {
            if (!acc[submission.team] || (submission.score && submission.score > acc[submission.team])) {
                acc[submission.team] = submission.score || 0;
        }
        return acc;
    }, {});

        const leaderboardTable = document.querySelector('.leaderboard-table tbody');
        if (!leaderboardTable) return;

        if (Object.keys(teams).length === 0) {
            // Default example data if no submissions
            leaderboardTable.innerHTML = `
                <tr>
                    <td>1</td>
                    <td>SignalPros</td>
                    <td>48.2</td>
                    <td>0.0021</td>
                    <td>94.5</td>
                </tr>
            `;
            return;
        }

    const leaderboardBody = Object.entries(teams)
        .sort((a, b) => b[1] - a[1])
        .map(([team, score], index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${team}</td>
                    <td>${typeof score === 'number' ? score.toFixed(2) : 'N/A'}</td>
            </tr>
        `).join('');

        leaderboardTable.innerHTML = leaderboardBody;
    }

    // Authentication logic
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

    // Modal display logic
document.querySelectorAll('[href="#login"], [href="#register"], [href="#logout"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
            const formType = e.target.getAttribute('href')?.substring(1);
            if (!formType) return;

        if (formType === 'logout') {
            localStorage.removeItem('authToken');
            alert('Logged out!');
            updateAuthState();
                window.location.href = 'index.html';
            return;
        }

            if (authModal) {
        authModal.style.display = 'block';
        showForm(formType);
            }
    });
});

    // Form switching
document.querySelectorAll('.switch-form').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
            const formType = e.target.getAttribute('href')?.substring(1);
            if (formType) showForm(formType);
    });
});

function showForm(formType) {
        if (loginForm) loginForm.style.display = formType === 'login' ? 'block' : 'none';
        if (registerForm) registerForm.style.display = formType === 'register' ? 'block' : 'none';
    }

    // Close modal
    document.querySelector('.close')?.addEventListener('click', () => {
        if (authModal) authModal.style.display = 'none';
    });

    // Registration form submission
    registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

        const teamNameInput = document.getElementById('registerTeam');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');

        if (!teamNameInput || !emailInput || !passwordInput) {
            alert('Form elements not found');
            return;
        }

    const teamData = {
            teamName: teamNameInput.value,
            email: emailInput.value,
            password: passwordInput.value
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

            if (!response.ok) throw new Error(data.message || 'Registration failed');

        alert('Registration successful! Please login.');
        showForm('login');
    } catch (error) {
            console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}`);
    }
});

    // Login form submission
    loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        if (!emailInput || !passwordInput) {
            alert('Form elements not found');
            return;
        }

    const credentials = {
            email: emailInput.value,
            password: passwordInput.value
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

            if (!response.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem('authToken', data.token);
            if (data.teamName) {
                localStorage.setItem('currentTeam', data.teamName);
                currentTeam = data.teamName;
            }

        updateAuthState();

            if (authModal) authModal.style.display = 'none';

            // Redirect after login
        window.location.href = 'team.html';
    } catch (error) {
            console.error('Login error:', error);
        alert(`Login failed: ${error.message}`);
    }
});

    // Update authentication state
function updateAuthState() {
    const isLoggedIn = !!localStorage.getItem('authToken');
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.textContent = isLoggedIn ? 'Logout' : 'Login';
        authButton.setAttribute('href', isLoggedIn ? '#logout' : '#login');
    }
}

    // Test Codabench connection
    async function testCodabenchConnection() {
        try {
            const response = await fetch('/api/test-codabench', {
                method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Successfully connected to Codabench API:', data);
                alert('Successfully connected to Codabench API. Check console for details.');
            } else {
                console.error('Failed to connect to Codabench API:', data);
                alert(`Failed to connect to Codabench API: ${data.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error testing Codabench connection:', error);
            alert(`Error: ${error.message}`);
            throw error;
        }
    }

    // Add test button event listener if it exists
    document.getElementById('testCodabenchButton')?.addEventListener('click', async () => {
        try {
            await testCodabenchConnection();
    } catch (error) {
            console.error('Test button error:', error);
    }
});

// Poll for submission status
async function pollSubmissionStatus(submissionId, statusElement) {
        if (!statusElement) return;

    try {
        const response = await fetch(`/api/submission-status/${submissionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Status check failed');
        }

        const data = await response.json();

        // Update the status element
        if (data.status === 'finished') {
            statusElement.innerHTML = `
                <h3>${data.description || 'Submission'}</h3>
                <p>Status: Completed</p>
                <p>Date: ${new Date(data.created).toLocaleDateString()}</p>
                <p>CR: ${data.scores?.CR || 'N/A'} | PRD: ${data.scores?.PRD || 'N/A'}</p>
                <p>Score: ${data.scores?.Score || 'N/A'}</p>
            `;

            // Update local storage
            updateSubmissionInLocalStorage(submissionId, 'Completed', data.scores);

            // Update leaderboard
            fetchLeaderboard();

        } else if (data.status === 'failed') {
            statusElement.innerHTML = `
                <h3>${data.description || 'Submission'}</h3>
                <p>Status: Failed</p>
                <p>Date: ${new Date(data.created).toLocaleDateString()}</p>
                <p>Error: ${data.error || 'Unknown error'}</p>
            `;

            updateSubmissionInLocalStorage(submissionId, 'Failed');

        } else {
            // Still processing, continue polling
            statusElement.innerHTML = `
                <h3>${data.description || 'Submission'}</h3>
                <p>Status: ${data.status}</p>
                <p>Date: ${new Date(data.created).toLocaleDateString()}</p>
                <p>Submission ID: ${submissionId}</p>
                    <div class="loading-spinner"></div>
            `;

            // Poll again after 10 seconds
            setTimeout(() => pollSubmissionStatus(submissionId, statusElement), 10000);
        }

    } catch (error) {
        console.error('Status polling error:', error);
        statusElement.innerHTML += `<p>Status update failed: ${error.message}</p>`;
    }
}

// Update submission in local storage
function updateSubmissionInLocalStorage(submissionId, status, scores = null) {
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const index = submissions.findIndex(s => s.id === submissionId);

    if (index !== -1) {
        submissions[index].status = status;
        if (scores) {
            submissions[index].scores = scores;
        }
        localStorage.setItem('submissions', JSON.stringify(submissions));

            // Update high score if needed
            if (scores && scores.Score && (parseFloat(scores.Score) > parseFloat(highScore))) {
                highScore = scores.Score;
                localStorage.setItem('highScore', highScore);
                updateTeamDisplay();
            }
    }
}

// Fetch leaderboard data
async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

            const data = await response.json();

            // 即使API返回错误，也能显示基本内容
            if (data.error) {
                console.warn('Leaderboard warning:', data.error);
            }

            // 更新排行榜表格
            const leaderboardTable = document.querySelector('.leaderboard-table tbody');
            if (leaderboardTable) {
                if (!data.results || data.results.length === 0) {
                    // 显示默认内容
                    leaderboardTable.innerHTML = `
                        <tr>
                            <td>1</td>
                            <td>${currentTeam || 'Your Team'}</td>
                            <td>N/A</td>
                            <td>N/A</td>
                            <td>N/A</td>
                        </tr>
                    `;
                } else {
        const leaderboardBody = data.results.map((entry, index) => `
            <tr>
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
        console.error('Leaderboard fetch error:', error);
    }
}

// Load submission history on page load
function loadSubmissionHistory() {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const historyContainer = document.getElementById('submissionHistory');

        if (!historyContainer) return;

    if (submissions.length === 0) {
        historyContainer.innerHTML = '<p>No submissions yet</p>';
        return;
    }

    historyContainer.innerHTML = '';

    submissions.forEach(submission => {
        const submissionElement = document.createElement('div');
        submissionElement.className = 'submission-card';
            submissionElement.id = `submission-${submission.id}`;

        submissionElement.innerHTML = `
                <h3>${submission.algorithm || 'Unknown Algorithm'}</h3>
                <p>Status: ${submission.status || 'Unknown'}</p>
            <p>Date: ${new Date(submission.date).toLocaleDateString()}</p>
            ${submission.scores ?
                `<p>CR: ${submission.scores.CR || 'N/A'} | PRD: ${submission.scores.PRD || 'N/A'}</p>
                 <p>Score: ${submission.scores.Score || 'N/A'}</p>` :
                ''}
            ${submission.status !== 'Completed' ?
                `<button class="btn btn-primary check-status" data-id="${submission.id}">Check Status</button>` :
                ''}
        `;

        historyContainer.appendChild(submissionElement);
    });

    // Add event listeners to status buttons
    document.querySelectorAll('.check-status').forEach(button => {
        button.addEventListener('click', async (e) => {
            const submissionId = e.target.dataset.id;
                if (!submissionId) return;

            const card = e.target.closest('.submission-card');
                if (card) {
                    e.target.disabled = true;
                    e.target.textContent = 'Checking...';
            await pollSubmissionStatus(submissionId, card);
                    e.target.disabled = false;
                    e.target.textContent = 'Check Status';
                }
        });
    });
}

    // Initialize on page load
    updateTeamDisplay();
    updateAuthState();
    updateLeaderboard();
    loadSubmissionHistory();
    fetchLeaderboard();
});