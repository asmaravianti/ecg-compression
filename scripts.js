// Form Validation
document.addEventListener("DOMContentLoaded", () => {
    // Mobile menu functionality
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '☰';
    document.querySelector('.navbar').appendChild(mobileMenuBtn);
    
    mobileMenuBtn.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu-btn') && !e.target.closest('.nav-links')) {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });

    // Setup tab switching for auth modal
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginContent = document.getElementById('loginContent');
    const registerContent = document.getElementById('registerContent');
    
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginContent.classList.add('active');
            registerContent.classList.remove('active');
        });
        
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerContent.classList.add('active');
            loginContent.classList.remove('active');
        });
    }
    
    // Setup validation for auth forms
    setupAuthFormValidation();
    
    // Paper submission type change handler
    document.getElementById('paperSubmissionType')?.addEventListener('change', function() {
        const fileGroup = document.getElementById('paperFileGroup');
        const linkGroup = document.getElementById('paperLinkGroup');
        
        if (this.value === 'file') {
            fileGroup.style.display = 'block';
            linkGroup.style.display = 'none';
            document.getElementById('paperLink').required = false;
            document.getElementById('paperFile').required = true;
        } else if (this.value === 'link') {
            fileGroup.style.display = 'none';
            linkGroup.style.display = 'block';
            document.getElementById('paperLink').required = true;
            document.getElementById('paperFile').required = false;
        } else {
            fileGroup.style.display = 'none';
            linkGroup.style.display = 'none';
            document.getElementById('paperLink').required = false;
            document.getElementById('paperFile').required = false;
        }
    });
    
    // Change team button handler
    document.getElementById('changeTeamBtn')?.addEventListener('click', function() {
        const teamForm = document.getElementById('teamForm');
        teamForm.style.display = teamForm.style.display === 'none' ? 'block' : 'none';
    });
    
    // Team form validation
    setupTeamFormValidation();
    
    // Login to submit button
    document.getElementById('loginToSubmitBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'block';
    });
    
    // Get started button
    document.getElementById('getStartedBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (!localStorage.getItem('authToken')) {
            // Not logged in, show login message
            const loginSection = document.getElementById('submit-login-message');
            loginSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        // Logged in, scroll to submit section
        const submitSection = document.getElementById('submit');
        submitSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Setup algorithm submission form
    setupAlgorithmSubmissionForm();
    
    // Initialize UI state
    updateTeamDisplay();
    updateAuthState();
    updateUIVisibility();
    
    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Special handling for auth-required sections
            if (this.classList.contains('auth-required-link') && !localStorage.getItem('authToken')) {
                e.preventDefault();
                alert('Please log in to access this section');
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'block';
                return;
            }
            
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Evaluation section interactions
    setupEvaluationInteractions();

    // Submission History initial setup
    const submissionHistoryElement = document.getElementById('submissionHistory');
    if (submissionHistoryElement && submissionHistoryElement.children.length === 0) {
        // Only set default content if there's no dynamic content yet
        loadSubmissionHistory();
    }
});

// Set up interactions for the evaluation section
function setupEvaluationInteractions() {
    // Add pulse effect on hover for metric blocks
    document.querySelectorAll('.metric-block').forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.querySelector('.metric-icon')?.classList.add('pulse-animation');
        });
        
        block.addEventListener('mouseleave', function() {
            this.querySelector('.metric-icon')?.classList.remove('pulse-animation');
        });
    });
    
    // Add numbered labels to process steps on small screens
    if (window.innerWidth <= 480) {
        document.querySelectorAll('.process-step').forEach((step, index) => {
            const stepContent = step.querySelector('.step-content h4');
            if (stepContent) {
                stepContent.textContent = `Step ${index + 1}: ${stepContent.textContent}`;
            }
        });
    }
    
    // Interactive formulas - highlight parts on hover
    document.querySelectorAll('.formula-display .fraction').forEach(fraction => {
        fraction.addEventListener('mouseenter', function() {
            this.style.color = 'var(--accent)';
            this.style.transform = 'scale(1.1)';
        });
        
        fraction.addEventListener('mouseleave', function() {
            this.style.color = '';
            this.style.transform = '';
        });
    });
}

// Setup Authentication Form Validation
function setupAuthFormValidation() {
    // Login form validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginEmailInput = document.getElementById('loginEmail');
        const loginPasswordInput = document.getElementById('loginPassword');
        
        // Setup live validation
        if (loginEmailInput) setupLiveValidation(loginEmailInput, validateEmail);
        if (loginPasswordInput) setupLiveValidation(loginPasswordInput, validatePassword);
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearValidationErrors(loginForm);
            
            const email = loginEmailInput?.value;
            const password = loginPasswordInput?.value;
            
            // Validate email
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                displayValidationError(loginEmailInput, emailValidation.message);
                return;
            }
            
            // Validate password
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                displayValidationError(loginPasswordInput, passwordValidation.message);
                return;
            }
            
            // If all validations pass, proceed with login
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                
                // Store the auth token and team name
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentTeam', data.teamName);
                
                // Update UI
                updateAuthState();
                updateUIVisibility();
                updateTeamDisplay();
                
                // Close the modal
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'none';
                
                alert('Login successful!');
            } catch (error) {
                alert(`Login error: ${error.message}`);
            }
        });
    }
    
    // Registration form validation
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const teamNameInput = document.getElementById('registerTeamName');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        // Setup live validation
        if (teamNameInput) setupLiveValidation(teamNameInput, validateTeamName);
        if (emailInput) setupLiveValidation(emailInput, validateEmail);
        if (passwordInput) setupLiveValidation(passwordInput, validatePassword);
        
        // Special validation for confirm password
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', () => {
                if (passwordInput?.value !== confirmPasswordInput.value) {
                    displayValidationError(confirmPasswordInput, 'Passwords do not match');
                }
            });
            
            confirmPasswordInput.addEventListener('focus', () => {
                const errorElement = confirmPasswordInput.parentElement.querySelector('.validation-error');
                if (errorElement) {
                    errorElement.remove();
                }
                confirmPasswordInput.classList.remove('invalid');
            });
        }
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearValidationErrors(registerForm);
            
            const teamName = teamNameInput?.value;
            const email = emailInput?.value;
            const password = passwordInput?.value;
            const confirmPassword = confirmPasswordInput?.value;
            
            // Validate team name
            const teamNameValidation = validateTeamName(teamName);
            if (!teamNameValidation.valid) {
                displayValidationError(teamNameInput, teamNameValidation.message);
                return;
            }
            
            // Validate email
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                displayValidationError(emailInput, emailValidation.message);
                return;
            }
            
            // Validate password
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                displayValidationError(passwordInput, passwordValidation.message);
                return;
            }
            
            // Validate confirm password
            if (password !== confirmPassword) {
                displayValidationError(confirmPasswordInput, 'Passwords do not match');
                return;
            }
            
            // If all validations pass, proceed with registration
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ teamName, email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                
                alert('Registration successful! Please login.');
                
                // Clear form and switch to login tab
                registerForm.reset();
                document.getElementById('loginTab')?.click();
            } catch (error) {
                alert(`Registration error: ${error.message}`);
            }
        });
    }
}

// Setup Team Form Validation
function setupTeamFormValidation() {
    // Team name form validation
    const teamForm = document.getElementById('teamForm');
    if (teamForm) {
        const teamNameInput = document.getElementById('teamName');
        
        // Setup live validation
        if (teamNameInput) setupLiveValidation(teamNameInput, validateTeamName);
        
        teamForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearValidationErrors(teamForm);
            
            const teamName = teamNameInput?.value;
            
            // Validate team name
            const teamNameValidation = validateTeamName(teamName);
            if (!teamNameValidation.valid) {
                displayValidationError(teamNameInput, teamNameValidation.message);
                return;
            }
            
            // If validation passes, save team name
            currentTeam = teamName;
            localStorage.setItem('currentTeam', currentTeam);
            
            // Update displays
            updateTeamDisplay();
            const teamDisplay = document.getElementById('currentTeamDisplay');
            if (teamDisplay) teamDisplay.textContent = currentTeam;
            
            // Hide the form
            teamForm.style.display = 'none';
            
            alert('Team name saved!');
        });
    }
}

// Setup Algorithm Submission Form
function setupAlgorithmSubmissionForm() {
    const algorithmForm = document.getElementById('algorithmSubmissionForm');
    if (algorithmForm) {
        const algorithmNameInput = document.getElementById('algorithmName');
        const compressedFileInput = document.getElementById('compressedFile');
        const paperFileInput = document.getElementById('paperFile');
        const paperLinkInput = document.getElementById('paperLink');
        const descriptionInput = document.getElementById('algorithmDescription');
        const paperTypeSelect = document.getElementById('paperSubmissionType');
        
        // Setup live validation
        if (algorithmNameInput) setupLiveValidation(algorithmNameInput, validateAlgorithmName);
        
        // Description validation
        if (descriptionInput) {
            descriptionInput.addEventListener('input', function() {
                if (this.value.length > 500) {
                    this.value = this.value.substring(0, 500);
                    displayValidationError(this, 'Description cannot exceed 500 characters');
                } else {
                    const errorElement = this.parentElement.querySelector('.validation-error');
                    if (errorElement) errorElement.remove();
                    this.classList.remove('invalid');
                }
            });
        }
        
        // File input validation
        if (compressedFileInput) {
            compressedFileInput.addEventListener('change', () => {
                const file = compressedFileInput.files[0];
                const fileValidation = validateFile(file, 'zip');
                displayValidationError(compressedFileInput, fileValidation.valid ? '' : fileValidation.message);
            });
        }
        
        // Paper file validation
        if (paperFileInput) {
            paperFileInput.addEventListener('change', () => {
                const file = paperFileInput.files[0];
                if (!file) {
                    displayValidationError(paperFileInput, 'Please select a PDF file');
                    return;
                }
                
                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    displayValidationError(paperFileInput, 'Please upload a PDF file');
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    displayValidationError(paperFileInput, 'File size must be less than 10MB');
                    return;
                }
                
                // Clear validation error if valid
                displayValidationError(paperFileInput, '');
            });
        }
        
        // Paper link validation
        if (paperLinkInput) {
            paperLinkInput.addEventListener('blur', () => {
                const url = paperLinkInput.value.trim();
                if (!url) {
                    displayValidationError(paperLinkInput, 'Please enter a valid URL');
                    return;
                }
                
                try {
                    new URL(url);
                    displayValidationError(paperLinkInput, '');
                } catch (e) {
                    displayValidationError(paperLinkInput, 'Please enter a valid URL');
                }
            });
        }
        
        algorithmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearValidationErrors(algorithmForm);
            
            // Verify login
            if (!localStorage.getItem('authToken')) {
                alert('Please log in to submit an algorithm');
                return;
            }
            
            // Verify team name
            if (!currentTeam) {
                alert('Please set a team name first!');
                document.getElementById('changeTeamBtn').click();
                return;
            }
            
            const algorithmName = algorithmNameInput?.value;
            const description = descriptionInput?.value;
            const file = compressedFileInput?.files[0];
            const paperType = paperTypeSelect?.value;
            
            // Validate algorithm name
            const algorithmNameValidation = validateAlgorithmName(algorithmName);
            if (!algorithmNameValidation.valid) {
                displayValidationError(algorithmNameInput, algorithmNameValidation.message);
                return;
            }
            
            // Validate description
            if (!description || description.trim().length < 10) {
                displayValidationError(descriptionInput, 'Please provide a detailed description of your algorithm');
                return;
            }
            
            // Validate algorithm file
            const fileValidation = validateFile(file, 'zip');
            if (!fileValidation.valid) {
                displayValidationError(compressedFileInput, fileValidation.message);
                return;
            }
            
            // Validate paper submission
            if (!paperType) {
                displayValidationError(paperTypeSelect, 'Please select a paper submission type');
                return;
            }
            
            if (paperType === 'file') {
                const paperFile = paperFileInput.files[0];
                if (!paperFile || !paperFile.name.toLowerCase().endsWith('.pdf')) {
                    displayValidationError(paperFileInput, 'Please upload a valid PDF file');
                    return;
                }
                
                if (paperFile.size > 10 * 1024 * 1024) { // 10MB limit
                    displayValidationError(paperFileInput, 'File size must be less than 10MB');
                    return;
                }
            } else if (paperType === 'link') {
                const paperLink = paperLinkInput.value.trim();
                if (!paperLink) {
                    displayValidationError(paperLinkInput, 'Please provide a link to your paper');
                    return;
                }
                
                try {
                    new URL(paperLink);
                } catch (e) {
                    displayValidationError(paperLinkInput, 'Please enter a valid URL');
                    return;
                }
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
                formData.append('description', description);
                formData.append('file', file);
                formData.append('paperType', paperType);
                
                if (paperType === 'file') {
                    formData.append('paperFile', paperFileInput.files[0]);
                } else if (paperType === 'link') {
                    formData.append('paperLink', paperLinkInput.value.trim());
                }
                
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
                        description: description,
                        filePath: uploadResult.filePath,
                        paperType: paperType,
                        paperPath: uploadResult.paperFilePath || null,
                        paperLink: paperType === 'link' ? paperLinkInput.value.trim() : null
                    })
                });
                
                // Parse response
                const responseText = await submissionResponse.text();
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error(`Failed to parse response: ${responseText}`);
                }
                
                if (!submissionResponse.ok) {
                    throw new Error(data.message || data.error || 'Submission failed');
                }
                
                // Handle successful submission
                const submission = {
                    id: data.submissionId || `local-${Date.now()}`,
                    team: currentTeam,
                    algorithm: algorithmName,
                    description: description,
                    date: new Date().toISOString(),
                    status: data.status === 'error-but-recorded' ? 'Pending (Offline)' : 'Processing',
                    file: file.name,
                    paperType: paperType,
                    paperFile: paperType === 'file' ? paperFileInput.files[0].name : null,
                    paperLink: paperType === 'link' ? paperLinkInput.value.trim() : null
                };
                
                // Save to local storage
                submissions.push(submission);
                localStorage.setItem('submissions', JSON.stringify(submissions));
                
                // Update displays
                updateTeamDisplay();
                loadSubmissionHistory();
                
                alert(data.status === 'error-but-recorded' ?
                    'Submission stored locally (Codabench connection issue)' :
                    'Submission received! Processing has begun.');
                
                // Reset form
                algorithmForm.reset();
                document.getElementById('paperFileGroup').style.display = 'none';
                document.getElementById('paperLinkGroup').style.display = 'none';
            } catch (error) {
                console.error('Submission error:', error);
                alert(`Submission failed: ${error.message}`);
            } finally {
                // Restore button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

// Validate files function
function validateFiles(files) {
    const zipValid = files.zip?.name.endsWith('.zip');
    const matValid = files.mat?.name.endsWith('.mat');
    return zipValid && matValid;
}

// Team Management
let currentTeam = localStorage.getItem('currentTeam') || null;
let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
let highScore = localStorage.getItem('highScore') || 0;

// Update team display
function updateTeamDisplay() {
    const currentTeamElem = document.getElementById('currentTeam');
    const currentTeamDisplayElem = document.getElementById('currentTeamDisplay');
    const highScoreElem = document.getElementById('highScore');
    const totalSubmissionsElem = document.getElementById('totalSubmissions');
    
    if (currentTeamElem) currentTeamElem.textContent = currentTeam || 'Not Set';
    if (currentTeamDisplayElem) currentTeamDisplayElem.textContent = currentTeam || 'Not Set';
    if (highScoreElem) highScoreElem.textContent = highScore;
    if (totalSubmissionsElem) totalSubmissionsElem.textContent = submissions.length.toString();
}

// Update UI visibility based on auth state
function updateUIVisibility() {
    const isLoggedIn = !!localStorage.getItem('authToken');
    
    // Show/hide login message
    const loginMessageSection = document.getElementById('submit-login-message');
    if (loginMessageSection) {
        loginMessageSection.style.display = isLoggedIn ? 'none' : 'block';
    }
    
    // Show/hide auth-required sections
    const authSections = document.querySelectorAll('.auth-required');
    authSections.forEach(section => {
        section.style.display = isLoggedIn ? 'block' : 'none';
    });
}

// Auth button and modal handling
function updateAuthState() {
    const authButton = document.getElementById('authButton');
    const authToken = localStorage.getItem('authToken');
    
    if (authButton) {
        if (authToken) {
            // User is logged in
            authButton.textContent = 'Logout';
            // Remove previous event listeners
            authButton.replaceWith(authButton.cloneNode(true));
            document.getElementById('authButton').addEventListener('click', () => {
                localStorage.removeItem('authToken');
                alert('You have been logged out.');
                updateAuthState();
                updateUIVisibility();
            });
        } else {
            // User is not logged in
            authButton.textContent = 'Login';
            // Remove previous event listeners
            authButton.replaceWith(authButton.cloneNode(true));
            document.getElementById('authButton').addEventListener('click', () => {
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'block';
            });
            
            // Initialize auth modal
            const modal = document.getElementById('authModal');
            const closeBtn = document.querySelector('.close');
            
            if (modal && closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
                
                window.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            }
        }
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

        let paperInfo = '';
        if (submission.paperType === 'file') {
            paperInfo = `<p>Paper: ${submission.paperFile || 'Uploaded'}</p>`;
        } else if (submission.paperType === 'link') {
            paperInfo = `<p>Paper: <a href="${submission.paperLink}" target="_blank" rel="noopener noreferrer">View Paper</a></p>`;
        }

        submissionElement.innerHTML = `
            <h3>${submission.algorithm || 'Unknown Algorithm'}</h3>
            <p>Status: ${submission.status || 'Unknown'}</p>
            <p>Date: ${new Date(submission.date).toLocaleDateString()}</p>
            <p>File: ${submission.file || 'Unknown'}</p>
            ${paperInfo}
            ${submission.description ? `<p>Description: ${submission.description.substring(0, 50)}${submission.description.length > 50 ? '...' : ''}</p>` : ''}
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

// Function to display toast notifications
function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Set toast icon based on type
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    // Populate toast content
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">×</button>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Setup close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Update form validation to use toasts
function displayValidationError(inputElement, errorMessage) {
    // Remove any existing error message
    const existingError = inputElement.parentElement.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message if one exists
    if (errorMessage) {
        const errorElement = document.createElement('div');
        errorElement.className = 'validation-error';
        errorElement.textContent = errorMessage;
        inputElement.parentElement.appendChild(errorElement);
        inputElement.classList.add('invalid');
        
        // Also show a toast for critical errors
        if (inputElement.required) {
            showToast(errorMessage, 'error');
        }
    } else {
        inputElement.classList.remove('invalid');
        
        // Add validated class when input is valid
        if (inputElement.value) {
            inputElement.classList.add('input-validated');
        }
    }
}

// Setup responsive navigation
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Show success toast after successful form submissions
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const originalSubmitHandler = loginForm.onsubmit;
    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        
        try {
            // Call original handler if it exists
            if (originalSubmitHandler) {
                await originalSubmitHandler.call(this, e);
            }
            
            // If no exceptions were thrown, show success message
            showToast('Login successful!', 'success');
        } catch (error) {
            // Error will be shown by the original handler
        }
    };
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    const originalSubmitHandler = registerForm.onsubmit;
    registerForm.onsubmit = async function(e) {
        e.preventDefault();
        
        try {
            // Call original handler if it exists
            if (originalSubmitHandler) {
                await originalSubmitHandler.call(this, e);
            }
            
            // If no exceptions were thrown, show success message
            showToast('Registration successful!', 'success');
        } catch (error) {
            // Error will be shown by the original handler
        }
    };
}

// Initialize the file upload handlers
document.addEventListener('DOMContentLoaded', function() {
    // Handle paper submission type toggle
    const paperSubmissionType = document.getElementById('paperSubmissionType');
    const paperFileGroup = document.getElementById('paperFileGroup');
    const paperLinkGroup = document.getElementById('paperLinkGroup');
    
    if (paperSubmissionType) {
        paperSubmissionType.addEventListener('change', function() {
            if (this.value === 'file') {
                paperFileGroup.style.display = 'block';
                paperLinkGroup.style.display = 'none';
            } else if (this.value === 'link') {
                paperFileGroup.style.display = 'none';
                paperLinkGroup.style.display = 'block';
            } else {
                paperFileGroup.style.display = 'none';
                paperLinkGroup.style.display = 'none';
            }
        });
    }
    
    // Initialize file upload UI for all file inputs
    setupFileUploadUI('paperFile');
    setupFileUploadUI('compressedFile');
    
    // Setup auth buttons
    const authButton = document.getElementById('authButton');
    const loginToSubmitBtn = document.getElementById('loginToSubmitBtn');
    const authModal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.close');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginContent = document.getElementById('loginContent');
    const registerContent = document.getElementById('registerContent');
    
    // Setup the login modal and auth-required sections
    if (authButton) {
        authButton.addEventListener('click', function() {
            if (authModal) authModal.style.display = 'block';
        });
    }
    
    if (loginToSubmitBtn) {
        loginToSubmitBtn.addEventListener('click', function() {
            if (authModal) authModal.style.display = 'block';
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (authModal) authModal.style.display = 'none';
        });
    }
    
    // Tab switching in auth modal
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', function() {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginContent.classList.add('active');
            registerContent.classList.remove('active');
        });
        
        registerTab.addEventListener('click', function() {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerContent.classList.add('active');
            loginContent.classList.remove('active');
        });
    }
    
    // Process login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate successful login
            simulateLogin();
            
            // Close modal
            if (authModal) authModal.style.display = 'none';
        });
    }
    
    // Process register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate passwords match
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // Simulate successful registration
            simulateLogin();
            
            // Close modal
            if (authModal) authModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });
    
    // Team info toggle
    const changeTeamBtn = document.getElementById('changeTeamBtn');
    const teamForm = document.getElementById('teamForm');
    
    if (changeTeamBtn && teamForm) {
        changeTeamBtn.addEventListener('click', function() {
            teamForm.style.display = 'block';
            this.style.display = 'none';
        });
        
        teamForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const teamName = document.getElementById('teamName').value;
            
            // Update team name in the UI
            document.getElementById('currentTeamDisplay').textContent = teamName;
            document.getElementById('currentTeam').textContent = teamName;
            
            // Hide form, show button
            teamForm.style.display = 'none';
            changeTeamBtn.style.display = 'inline-block';
        });
    }
});

/**
 * Set up the enhanced file upload UI
 * @param {string} inputId The ID of the file input element
 */
function setupFileUploadUI(inputId) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput) return;
    
    const fileUpload = fileInput.closest('.file-upload');
    const uploadMessage = fileUpload.querySelector('.upload-message');
    const filePreview = document.getElementById(inputId + 'Preview');
    const fileName = filePreview ? filePreview.querySelector('.file-name') : null;
    const removeButton = filePreview ? filePreview.querySelector('.remove-file') : null;
    
    // Update UI when file is selected
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            updateFilePreview(file);
        }
    });
    
    // Handle drag and drop
    fileUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    fileUpload.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    fileUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files.length > 0) {
            fileInput.files = files;
            updateFilePreview(files[0]);
        }
    });
    
    // Set up remove button
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Clear file input
            fileInput.value = '';
            
            // Hide preview
            if (filePreview) filePreview.style.display = 'none';
            
            // Reset upload area appearance
            fileUpload.classList.remove('has-file');
            if (uploadMessage) uploadMessage.textContent = `Click to upload ${inputId === 'paperFile' ? 'PDF' : 'ZIP'} file`;
        });
    }
    
    // Helper function to update file preview
    function updateFilePreview(file) {
        if (!filePreview || !fileName) return;
        
        // Show selected file name
        fileName.textContent = file.name;
        filePreview.style.display = 'flex';
        
        // Update upload area appearance
        fileUpload.classList.add('has-file');
        if (uploadMessage) uploadMessage.textContent = 'File selected:';
    }
}

/**
 * Simulate a successful login
 */
function simulateLogin() {
    // Update auth button
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.textContent = 'My Account';
        authButton.href = '#submissions';
    }
    
    // Show auth-required sections
    const authSections = document.querySelectorAll('.auth-required');
    authSections.forEach(function(section) {
        section.style.display = 'block';
    });
    
    // Hide login message
    const loginMessage = document.getElementById('submit-login-message');
    if (loginMessage) {
        loginMessage.style.display = 'none';
    }
    
    // Hide auth-required links that would redirect to login
    const authLinks = document.querySelectorAll('.auth-required-link');
    authLinks.forEach(function(link) {
        link.classList.remove('auth-required-link');
    });
    
    // Set default team name if not already set
    const currentTeamDisplay = document.getElementById('currentTeamDisplay');
    const currentTeam = document.getElementById('currentTeam');
    
    if (currentTeamDisplay && currentTeamDisplay.textContent === 'Not Set') {
        const teamName = document.getElementById('registerTeamName') ? 
            document.getElementById('registerTeamName').value : 'Demo Team';
        
        currentTeamDisplay.textContent = teamName;
        if (currentTeam) currentTeam.textContent = teamName;
    }
    
    // Set demo values for dashboard
    document.getElementById('highScore').textContent = '0.00';
    document.getElementById('totalSubmissions').textContent = '0';
}

// Function to validate the submission form
function validateSubmissionForm() {
    let isValid = true;
    
    // Remove all error messages first
    const errorElements = document.querySelectorAll('.validation-error');
    errorElements.forEach(element => element.remove());

    // Check algorithm name
    const algorithmName = document.getElementById('algorithmName');
    if (!algorithmName || !algorithmName.value.trim()) {
        displayValidationError(algorithmName, 'Please enter an algorithm name.');
        isValid = false;
    }
    
    // Check submission type if paper is required
    const paperSubmissionType = document.getElementById('paperSubmissionType');
    if (paperSubmissionType && paperSubmissionType.value) {
        if (paperSubmissionType.value === 'file') {
            const paperFile = document.getElementById('paperFile');
            if (!paperFile || !paperFile.files || paperFile.files.length === 0) {
                displayValidationError(paperFile, 'Please select a PDF file for your paper.');
                isValid = false;
            }
        } else if (paperSubmissionType.value === 'link') {
            const paperLink = document.getElementById('paperLink');
            if (!paperLink || !paperLink.value.trim()) {
                displayValidationError(paperLink, 'Please provide a link to your paper.');
                isValid = false;
            }
        }
    }
    
    // Algorithm description is optional, no validation needed
    
    // Check algorithm implementation file
    const fileInput = document.getElementById('compressedFile');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        displayValidationError(fileInput, 'Please select a ZIP file containing your algorithm implementation.');
        isValid = false;
    }
    
    return isValid;
}