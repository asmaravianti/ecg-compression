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

// Enhanced validation functions
function validateEmail(email) {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // More flexible password validation
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    
    return {
        valid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
    };
}

function validateDOI(doi) {
    // Validate DOI format - can be URL or just DOI string
    const doiRegex = /^(https?:\/\/)?(dx\.)?doi\.org\/10\.\d{4,}\/\S+$|^10\.\d{4,}\/\S+$/;
    return doiRegex.test(doi);
}

function validatePaperSubmission() {
    const paperType = document.querySelector('input[name="paperType"]:checked');
    if (!paperType) {
        return { valid: false, message: 'Please select either paper upload or DOI link' };
    }

    const paperTitle = document.getElementById('paperTitle').value.trim();
    const paperAuthors = document.getElementById('paperAuthors').value.trim();

    if (!paperTitle) {
        return { valid: false, message: 'Paper title is required' };
    }

    if (!paperAuthors) {
        return { valid: false, message: 'Paper authors are required' };
    }

    if (paperType.value === 'upload') {
        const paperFile = document.getElementById('paperFile').files[0];
        if (!paperFile) {
            return { valid: false, message: 'Please upload your paper document' };
        }
        
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(paperFile.type)) {
            return { valid: false, message: 'Paper must be in PDF, DOC, or DOCX format' };
        }
        
        // Check file size (max 25MB)
        if (paperFile.size > 25 * 1024 * 1024) {
            return { valid: false, message: 'Paper file size must be less than 25MB' };
        }
    } else if (paperType.value === 'doi') {
        const doiInput = document.getElementById('paperDOIInput').value.trim();
        if (!doiInput) {
            return { valid: false, message: 'Please provide the DOI link' };
        }
        
        if (!validateDOI(doiInput)) {
            return { valid: false, message: 'Please enter a valid DOI (e.g., 10.1000/example or https://doi.org/10.1000/example)' };
        }
    }

    return { valid: true };
}

// Paper submission form handlers
function setupPaperSubmissionHandlers() {
    const paperUploadRadio = document.getElementById('paperUpload');
    const paperDOIRadio = document.getElementById('paperDOI');
    const paperUploadSection = document.getElementById('paperUploadSection');
    const paperDOISection = document.getElementById('paperDOISection');

    if (paperUploadRadio && paperDOIRadio && paperUploadSection && paperDOISection) {
        paperUploadRadio.addEventListener('change', function() {
            if (this.checked) {
                paperUploadSection.style.display = 'block';
                paperDOISection.style.display = 'none';
                document.getElementById('paperFile').required = true;
                document.getElementById('paperDOIInput').required = false;
            }
        });

        paperDOIRadio.addEventListener('change', function() {
            if (this.checked) {
                paperDOISection.style.display = 'block';
                paperUploadSection.style.display = 'none';
                document.getElementById('paperDOIInput').required = true;
                document.getElementById('paperFile').required = false;
            }
        });
    }
}

// Enhanced form validation with real-time feedback
function setupFormValidation() {
    // Email validation
    const emailInput = document.getElementById('registerEmail');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value;
            const isValid = validateEmail(email);
            
            if (email.length > 0) {
                if (isValid) {
                    this.style.borderColor = 'var(--accent)';
                    this.setCustomValidity('');
                } else {
                    this.style.borderColor = 'var(--secondary)';
                    this.setCustomValidity('Please enter a valid email address');
                }
            } else {
                this.style.borderColor = '';
                this.setCustomValidity('');
            }
        });
    }

    // Improved password validation with detailed feedback
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
        // Create or find password help text element
        let helpText = passwordInput.parentNode.querySelector('.password-help');
        if (!helpText) {
            helpText = document.createElement('div');
            helpText.className = 'password-help';
            helpText.style.cssText = `
                font-size: 0.85rem;
                margin-top: 0.5rem;
                padding: 0.75rem;
                border-radius: 6px;
                background: var(--surface);
                border: 1px solid #e2e8f0;
                display: none;
            `;
            passwordInput.parentNode.appendChild(helpText);
        }

        passwordInput.addEventListener('focus', function() {
            helpText.style.display = 'block';
        });

        passwordInput.addEventListener('blur', function() {
            if (this.value.length === 0) {
                helpText.style.display = 'none';
            }
        });

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const validation = validatePassword(password);
            
            // Update help text with validation status
            helpText.innerHTML = `
                <div style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">Password Requirements:</div>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <span style="color: ${validation.minLength ? '#10b981' : '#ef4444'};">
                        ${validation.minLength ? '✅' : '❌'} At least 8 characters
                    </span>
                    <span style="color: ${validation.hasUpper ? '#10b981' : '#ef4444'};">
                        ${validation.hasUpper ? '✅' : '❌'} One uppercase letter
                    </span>
                    <span style="color: ${validation.hasLower ? '#10b981' : '#ef4444'};">
                        ${validation.hasLower ? '✅' : '❌'} One lowercase letter
                    </span>
                    <span style="color: ${validation.hasNumber ? '#10b981' : '#ef4444'};">
                        ${validation.hasNumber ? '✅' : '❌'} One number
                    </span>
                    <span style="color: ${validation.hasSpecial ? '#10b981' : '#ef4444'};">
                        ${validation.hasSpecial ? '✅' : '❌'} One special character (@$!%*?&)
                    </span>
                </div>
            `;
            
            if (password.length > 0) {
                if (validation.valid) {
                    this.style.borderColor = 'var(--accent)';
                    this.setCustomValidity('');
                } else {
                    this.style.borderColor = 'var(--secondary)';
                    // Don't set custom validity here - let the form handle it
                }
            } else {
                this.style.borderColor = '';
                this.setCustomValidity('');
            }
        });
    }

    // DOI validation
    const doiInput = document.getElementById('paperDOIInput');
    if (doiInput) {
        doiInput.addEventListener('input', function() {
            const doi = this.value.trim();
            const isValid = validateDOI(doi);
            
            if (doi && !isValid) {
                this.setCustomValidity('Please enter a valid DOI');
                this.style.borderColor = 'var(--secondary)';
            } else {
                this.setCustomValidity('');
                this.style.borderColor = isValid ? 'var(--accent)' : '';
            }
        });
    }
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
    const teamSection = document.getElementById('team');
    const submitSection = document.getElementById('submit');
    const submissionsSection = document.getElementById('submissions');

    console.log('🔄 Updating auth state:', { isLoggedIn, hasTeam: !!currentTeam });

    // Update auth button
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
                if (getAuthToken()) {
                    // If logged in, this should be logout
                    logout();
                } else {
                    // Show login modal
                    openModal('authModal');
                    showForm('login');
                }
            };
        }
    }

    // Show/hide authenticated sections based on login status
    const authenticatedSections = [
        { element: teamSection, name: 'team management' },
        { element: submitSection, name: 'algorithm submission' },
        { element: submissionsSection, name: 'my submissions' }
    ];

    authenticatedSections.forEach(({ element, name }) => {
        if (element) {
            if (isLoggedIn) {
                element.style.display = 'block';
                console.log(`✅ Showing ${name} section for authenticated user`);
            } else {
                element.style.display = 'none';
                console.log(`🔒 Hiding ${name} section for unauthenticated user`);
            }
        }
    });

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
                <td>2024-03-01</td>
            </tr>
            <tr>
                <td>2</td>
                <td>DataMasters</td>
                <td>42.1</td>
                <td>0.0031</td>
                <td>89.2</td>
                <td>2024-02-28</td>
            </tr>
            <tr>
                <td>3</td>
                <td>Debug Divas</td>
                <td>43.7</td>
                <td>0.0087</td>
                <td>83.9</td>
                <td>2024-02-25</td>
            </tr>
            <tr>
                <td>4</td>
                <td>EcgExperts</td>
                <td>39.8</td>
                <td>0.0045</td>
                <td>82.7</td>
                <td>2024-02-22</td>
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
    console.log('📤 Starting file submission...');
    
    const token = getAuthToken();
    if (!token) {
        alert('Please login first!');
        return;
    }

    const algorithmName = document.getElementById('algorithmName')?.value;
    const compressedFile = document.getElementById('compressedFile')?.files[0];

    if (!algorithmName || !compressedFile) {
        alert('Please fill in all required fields and select files!');
        return;
    }

    // Validate paper submission
    const paperValidation = validatePaperSubmission();
    if (!paperValidation.valid) {
        alert(paperValidation.message);
        return;
    }

    const formData = new FormData();
    
    // Use field names that match what the server expects
    formData.append('algorithmName', algorithmName);
    formData.append('teamName', currentTeam || 'DefaultTeam'); // Server expects teamName
    formData.append('file', compressedFile); // Server expects 'file' for multer upload
    
    // Add paper information
    const paperTitle = document.getElementById('paperTitle').value.trim();
    const paperAuthors = document.getElementById('paperAuthors').value.trim();
    const paperType = document.querySelector('input[name="paperType"]:checked').value;

    formData.append('paperTitle', paperTitle);
    formData.append('paperAuthors', paperAuthors);
    formData.append('paperType', paperType);

    if (paperType === 'upload') {
        const paperFile = document.getElementById('paperFile').files[0];
        formData.append('paperFile', paperFile);
    } else if (paperType === 'doi') {
        const paperDOI = document.getElementById('paperDOIInput').value.trim();
        formData.append('paperDOI', paperDOI);
    }

    try {
        console.log('🚀 Sending submission...');
        console.log('📊 Submission data:', {
            algorithmName,
            teamName: currentTeam,
            fileName: compressedFile.name,
            fileSize: compressedFile.size
        });
        
        const response = await fetch(`${API_BASE_URL}/submit-to-codabench`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type - let browser set it for FormData
            },
            body: formData
        });

        const data = await response.json();
        console.log('📤 Submission response:', data);

        if (response.ok && data.success) {
            alert(`Submission successful! Your algorithm "${algorithmName}" has been submitted for evaluation.`);
            
            // Add the new submission to our local storage
            const newSubmission = {
                id: data.submissionId,
                algorithmName: algorithmName,
                teamName: currentTeam,
                status: data.status,
                timestamp: new Date().toISOString(),
                date: new Date().toISOString(), // Add date field for compatibility
                platform: data.platform,
                scores: data.scores,
                metrics: {
                    CR: data.scores?.CR || data.details?.CR,
                    PRD: data.scores?.PRD || data.details?.PRD,
                    Score: data.scores?.Score || data.details?.Score
                },
                score: data.scores?.Score || data.details?.Score || 0
            };
            
            // Add to submissions array and save to localStorage
            submissions.unshift(newSubmission); // Add to beginning of array
            localStorage.setItem('submissions', JSON.stringify(submissions));
            
            // Update high score if this is better
            const currentScore = newSubmission.score;
            if (currentScore > parseFloat(highScore)) {
                highScore = currentScore.toFixed(2);
                localStorage.setItem('highScore', highScore);
            }
            
            // Reset form
            document.getElementById('submissionForm').reset();
            document.getElementById('paperUploadSection').style.display = 'none';
            document.getElementById('paperDOISection').style.display = 'none';
            
            // Update all displays
            updateSubmissionsDisplay();
            updateTeamDisplay();
            updatePersonalSubmissionHistory();
            
            console.log('✅ Submission added to local storage:', newSubmission);
        } else {
            throw new Error(data.message || 'Submission failed');
        }
    } catch (error) {
        console.error('❌ Submission error:', error);
        alert(`Submission failed: ${error.message}`);
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
        console.log('📝 Registering new team:', teamName);

        // Client-side validation
        if (!teamName || teamName.length < 3 || teamName.length > 50) {
            alert('Team name must be between 3 and 50 characters');
            return;
        }

        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            alert('Password must meet all requirements: 8+ characters, uppercase, lowercase, number, and special character');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamName, email, password }),
        });

        const data = await response.json();
        console.log('📝 Registration response:', data);

        if (response.ok && data.success) {
            alert('Registration successful! You can now login.');
            showForm('login');
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
            
            // Store registration date if not already stored
            if (!localStorage.getItem('registeredDate')) {
                localStorage.setItem('registeredDate', new Date().toISOString());
            }

            // Close modal and restore scrolling
            closeModal('authModal');
            document.body.style.overflow = ''; // Ensure scrolling is restored

            // Update auth state to show team management section
            updateAuthState();
            updateTeamDisplay();
            updateProfileDisplay();

            alert('Login successful! You can now manage your profile and submit algorithms.');
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

    // Ensure scrolling is enabled
    document.body.style.overflow = '';

    // Update auth state to hide team management section
    updateAuthState();
    updateTeamDisplay();

    alert('Logged out successfully!');
}

function setupEventListeners() {
    // Setup paper submission handlers
    setupPaperSubmissionHandlers();
    
    // Setup form validation
    setupFormValidation();

    // Navigation links
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const sectionId = href.substring(1); // Remove #
            
            // Handle special cases
            if (sectionId === 'login') {
                if (getAuthToken()) {
                    logout();
                } else {
                    openModal('authModal');
                    showForm('login');
                }
            } else if (sectionId === 'profile' || sectionId === 'submission') {
                // Check if user is logged in for protected sections
                if (!getAuthToken()) {
                    alert('Please login first to access this section!');
                    openModal('authModal');
                    showForm('login');
                    return;
                }
                showSection(sectionId);
            } else {
                showSection(sectionId);
            }
        });
    });

    // Show home section by default
    showSection('home');

    // Submission form with enhanced validation
    const submissionForm = document.getElementById('submissionForm');
    if (submissionForm) {
        submissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitFiles();
        });
    }

    // Modal close button
    const closeModalBtn = document.querySelector('.close');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            closeModal('authModal');
        });
    }

    // Click outside modal to close
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal('authModal');
            }
        });

        // Handle escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal('authModal');
            }
        });
    }

    // Auth button (Login/Logout)
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (getAuthToken()) {
                logout();
            } else {
                openModal('authModal');
                showForm('login');
            }
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const teamName = document.getElementById('loginTeam').value;
            const password = document.getElementById('loginPassword').value;
            login(teamName, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const teamName = document.getElementById('registerTeam').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            await register(teamName, email, password);
            document.body.style.overflow = ''; // Ensure scrolling is restored after registration
        });
    }

    // Form switching
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

    // Clear cache button
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all cached data?')) {
                localStorage.clear();
                document.body.style.overflow = ''; // Ensure scrolling is restored
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
    updateProfileDisplay();
    updateSubmissionsDisplay();
    updateLeaderboard();

    // Test Codabench connection on page load
    testCodabenchConnectionOnLoad();

    // Initialize the page with the home section
    showSection('home');
});

// Test Codabench connection when page loads
async function testCodabenchConnectionOnLoad() {
    const token = getAuthToken();
    if (token) {
        try {
            console.log('🔌 Testing Codabench connection...');
            const response = await fetch(`${API_BASE_URL}/test-codabench`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ Codabench Status: Connected successfully');
                console.log('📋 Competition ID configured:', data.competitionId || 'Not specified');
            } else {
                console.log('⚠️ Codabench Status: Connection failed -', data.message);
            }
        } catch (error) {
            console.log('❌ Codabench Status: Connection error -', error.message);
        }
    } else {
        console.log('🔒 Codabench Status: Not tested (user not logged in)');
    }
}

// Modal management functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        console.log('📱 Modal opened:', modalId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore background scroll
        console.log('📱 Modal closed:', modalId);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = ''; // Restore background scroll
}

// Profile management functions
function updateProfileDisplay() {
    const profileTeamName = document.getElementById('profileTeamName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRegisteredDate = document.getElementById('profileRegisteredDate');
    const profileSubmissionCount = document.getElementById('profileSubmissionCount');
    const profileBestScore = document.getElementById('profileBestScore');
    const profileTotalSubmissions = document.getElementById('profileTotalSubmissions');
    const profileBestRank = document.getElementById('profileBestRank');

    // Get user data from token or localStorage
    const token = getAuthToken();
    if (token) {
        try {
            // Decode JWT to get user info (simple base64 decode for demo)
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            if (profileTeamName) profileTeamName.textContent = payload.teamName || currentTeam || 'Not Set';
            if (profileEmail) profileEmail.textContent = payload.email || 'Not Set';
        } catch (error) {
            console.log('Could not decode token for profile display');
        }
    }

    // Update other profile fields
    if (profileSubmissionCount) profileSubmissionCount.textContent = submissions.length.toString();
    if (profileBestScore) profileBestScore.textContent = highScore || '0';
    if (profileTotalSubmissions) profileTotalSubmissions.textContent = submissions.length.toString();
    if (profileBestRank) profileBestRank.textContent = submissions.length > 0 ? Math.floor(Math.random() * 50) + 1 : '-';
    
    // Set registered date from localStorage or default
    const registeredDate = localStorage.getItem('registeredDate') || 'Unknown';
    if (profileRegisteredDate) {
        if (registeredDate !== 'Unknown') {
            profileRegisteredDate.textContent = new Date(registeredDate).toLocaleDateString();
        } else {
            profileRegisteredDate.textContent = 'Unknown';
        }
    }
}

// Update team name
async function updateTeamName(newTeamName) {
    try {
        const token = getAuthToken();
        if (!token) {
            alert('Please login first!');
            return;
        }

        if (!newTeamName || newTeamName.length < 3 || newTeamName.length > 50) {
            alert('Team name must be between 3 and 50 characters');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/update-team-name`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newTeamName })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentTeam = newTeamName;
            localStorage.setItem('currentTeam', newTeamName);
            updateProfileDisplay();
            updateTeamDisplay();
            alert('Team name updated successfully!');
            document.getElementById('newTeamName').value = '';
        } else {
            throw new Error(data.message || 'Team name update failed');
        }
    } catch (error) {
        console.error('❌ Team name update error:', error);
        alert(`Team name update failed: ${error.message}`);
    }
}

// Update email
async function updateEmail(newEmail) {
    try {
        const token = getAuthToken();
        if (!token) {
            alert('Please login first!');
            return;
        }

        if (!validateEmail(newEmail)) {
            alert('Please enter a valid email address');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/update-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newEmail })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            updateProfileDisplay();
            alert('Email updated successfully!');
            document.getElementById('newEmail').value = '';
        } else {
            throw new Error(data.message || 'Email update failed');
        }
    } catch (error) {
        console.error('❌ Email update error:', error);
        alert(`Email update failed: ${error.message}`);
    }
}

// Change password
async function changePassword(currentPassword, newPassword, confirmPassword) {
    try {
        const token = getAuthToken();
        if (!token) {
            alert('Please login first!');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New password and confirmation do not match');
            return;
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            alert('New password must meet all requirements');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('Password changed successfully!');
            document.getElementById('changePasswordForm').reset();
        } else {
            throw new Error(data.message || 'Password change failed');
        }
    } catch (error) {
        console.error('❌ Password change error:', error);
        alert(`Password change failed: ${error.message}`);
    }
}

// Download user data
async function downloadUserData() {
    try {
        const token = getAuthToken();
        if (!token) {
            alert('Please login first!');
            return;
        }

        const userData = {
            teamName: currentTeam,
            submissions: submissions,
            registeredDate: localStorage.getItem('registeredDate'),
            totalSubmissions: submissions.length,
            bestScore: highScore
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTeam || 'user'}_data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ User data downloaded');
    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Failed to download user data');
    }
}

// Navigation functions
function showSection(sectionId) {
    // Special handling for protected and hidden sections
    if (['profile', 'submission', 'leaderboard'].includes(sectionId)) {
        // Check if user is logged in for protected sections
        if ((sectionId === 'profile' || sectionId === 'submission') && !getAuthToken()) {
            alert('Please login first to access this section!');
            openModal('authModal');
            showForm('login');
            return;
        }
        
        // Hide all hideable sections
        const hideableSections = document.querySelectorAll('#profile, #submission, #leaderboard');
        hideableSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show the requested section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.scrollIntoView({ behavior: 'smooth' });
            
            // Update section-specific data when shown
            if (sectionId === 'profile') {
                updateProfileDisplay();
            } else if (sectionId === 'submission') {
                updateSubmissionPageData();
            } else if (sectionId === 'leaderboard') {
                updateLeaderboard();
            }
        }
    } else if (sectionId === 'home') {
        // For home, hide the hideable sections and scroll to top
        const hideableSections = document.querySelectorAll('#profile, #submission, #leaderboard');
        hideableSections.forEach(section => {
            section.style.display = 'none';
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // For other sections (evaluation, forum, terms), just scroll to them
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Update active nav link
    updateActiveNavLink(sectionId);
}

function updateActiveNavLink(activeSection) {
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to current section link
    const activeLink = document.querySelector(`.nav-links a[href="#${activeSection}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Enhanced submission page functions
async function updateSubmissionPageData() {
    try {
        const token = getAuthToken();
        if (!token) {
            // Show login required message
            showGuestSubmissionView();
            return;
        }

        // Update personal ranking stats
        await updatePersonalStats();
        
        // Update leaderboard preview
        await updateLeaderboardPreview();
        
        // Update submission history
        await updatePersonalSubmissionHistory();
        
    } catch (error) {
        console.error('Error updating submission page:', error);
    }
}

function showGuestSubmissionView() {
    // Show limited view for non-logged-in users
    document.getElementById('currentRank').textContent = '-';
    document.getElementById('bestScore').textContent = '0';
    document.getElementById('totalSubmissions').textContent = '0';
    document.getElementById('averageScore').textContent = '0';
    
    const submissionHistory = document.getElementById('submissionHistory');
    submissionHistory.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
            <p>Please <a href="#login" onclick="openModal('authModal')">login</a> to view your submission history and submit algorithms.</p>
        </div>
    `;
}

async function updatePersonalStats() {
    try {
        // Calculate stats from local submissions
        const userSubmissions = submissions.filter(sub => sub.teamName === currentTeam);
        const completedSubmissions = userSubmissions.filter(sub => sub.status === 'completed');
        
        const totalSubs = userSubmissions.length;
        const bestScore = completedSubmissions.length > 0 ? 
            Math.max(...completedSubmissions.map(sub => sub.score || 0)) : 0;
        const avgScore = completedSubmissions.length > 0 ? 
            completedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / completedSubmissions.length : 0;
        
        // Get current rank from leaderboard
        const currentRank = await getUserRankFromLeaderboard();
        
        // Update UI
        document.getElementById('currentRank').textContent = currentRank || '-';
        document.getElementById('bestScore').textContent = bestScore.toFixed(1);
        document.getElementById('totalSubmissions').textContent = totalSubs.toString();
        document.getElementById('averageScore').textContent = avgScore.toFixed(1);
        
    } catch (error) {
        console.error('Error updating personal stats:', error);
    }
}

async function getUserRankFromLeaderboard() {
    try {
        const token = getAuthToken();
        if (!token) return null;

        const response = await fetch(`${API_BASE_URL}/leaderboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const results = data.results || [];
            
            // Find current user's rank
            const userIndex = results.findIndex(result => result.participant_name === currentTeam);
            return userIndex >= 0 ? userIndex + 1 : null;
        }
    } catch (error) {
        console.error('Error getting user rank:', error);
    }
    return null;
}

async function updateLeaderboardPreview() {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/leaderboard`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (response.ok) {
            const data = await response.json();
            const results = data.results || [];
            
            // Show top 3 entries
            const topResults = results.slice(0, 3);
            const leaderboardPreview = document.getElementById('leaderboardPreview');
            
            if (leaderboardPreview) {
                if (topResults.length === 0) {
                    showDefaultLeaderboardPreview();
                } else {
                    leaderboardPreview.innerHTML = topResults.map((result, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${result.participant_name}</td>
                            <td>${result.scores?.CR?.toFixed(1) || 'N/A'}</td>
                            <td>${result.scores?.PRD?.toFixed(4) || 'N/A'}</td>
                            <td>${result.scores?.Score?.toFixed(1) || 'N/A'}</td>
                        </tr>
                    `).join('');
                }
            }
        } else {
            showDefaultLeaderboardPreview();
        }
    } catch (error) {
        console.error('Error updating leaderboard preview:', error);
        showDefaultLeaderboardPreview();
    }
}

function showDefaultLeaderboardPreview() {
    const leaderboardPreview = document.getElementById('leaderboardPreview');
    if (leaderboardPreview) {
        leaderboardPreview.innerHTML = `
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
                <td>Debug Divas</td>
                <td>43.7</td>
                <td>0.0087</td>
                <td>83.9</td>
            </tr>
        `;
    }
}

async function updatePersonalSubmissionHistory() {
    try {
        const submissionHistory = document.getElementById('submissionHistory');
        const noSubmissions = document.getElementById('noSubmissions');
        
        // Check if elements exist before accessing their properties
        if (!submissionHistory) {
            console.warn('submissionHistory element not found');
            return;
        }
        
        // Get user submissions (from localStorage for now)
        const userSubmissions = submissions.filter(sub => sub.teamName === currentTeam);
        
        if (userSubmissions.length === 0) {
            if (noSubmissions) {
                noSubmissions.style.display = 'block';
                submissionHistory.innerHTML = '';
                submissionHistory.appendChild(noSubmissions);
            } else {
                submissionHistory.innerHTML = '<p>No submissions yet.</p>';
            }
            return;
        }
        
        if (noSubmissions) {
            noSubmissions.style.display = 'none';
        }
        
        // Sort submissions by date (newest first)
        userSubmissions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        submissionHistory.innerHTML = userSubmissions.map((submission, index) => `
            <div class="submission-card interactive-hover">
                <h3>🔬 Submission #${userSubmissions.length - index}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                    <div>
                        <p><strong>Status:</strong> <span class="status-${submission.status || 'unknown'}">${getStatusIcon(submission.status)} ${formatStatus(submission.status)}</span></p>
                        <p><strong>Algorithm:</strong> ${submission.algorithmName || 'Unknown'}</p>
                        <p><strong>Date:</strong> ${formatDate(submission.date)}</p>
                    </div>
                    <div>
                        <p><strong>CR:</strong> ${submission.metrics?.CR?.toFixed(1) || 'N/A'}</p>
                        <p><strong>PRD:</strong> ${submission.metrics?.PRD?.toFixed(4) || 'N/A'}</p>
                        <p><strong>Score:</strong> ${submission.score?.toFixed(1) || 'N/A'}</p>
                    </div>
                </div>
                ${submission.status === 'processing' ? `
                    <button class="btn btn-secondary btn-sm" onclick="checkSubmissionStatus('${submission.id}')">
                        🔄 Check Status
                    </button>
                ` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error updating submission history:', error);
    }
}

function getStatusIcon(status) {
    const icons = {
        'processing': '⏳',
        'completed': '✅',
        'scored-locally': '✅',
        'failed': '❌',
        'error': '❌'
    };
    return icons[status] || '❓';
}

function formatStatus(status) {
    const statusMap = {
        'processing': 'Processing',
        'completed': 'Completed',
        'scored-locally': 'Completed (Local)',
        'failed': 'Failed',
        'error': 'Error'
    };
    return statusMap[status] || 'Unknown';
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        return 'Unknown';
    }
}

