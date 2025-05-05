/**
 * Codabench Integration
 * This file handles all interactions with the Codabench platform
 */

class CodabenchIntegration {
    constructor() {
        this.secretUrl = document.getElementById('codabenchSecretUrl')?.value || '';
        this.secretKey = this.extractSecretKey(this.secretUrl);
        // For development, we'll use a mock API approach
        this.useLocalMock = true; // Set to false in production
    }

    /**
     * Submit an algorithm to Codabench
     * @param {FormData} formData The submission form data
     * @returns {Promise} Promise with submission response
     */
    async submitAlgorithm(formData) {
        try {
            // Display loading state
            this.showToast('Submitting your algorithm to the competition...', 'info');
            
            if (this.useLocalMock) {
                // Simulate API call with mock response
                await this.simulateNetworkDelay();
                
                // Generate a fake submission ID
                const submissionId = 'sub_' + Math.random().toString(36).substring(2, 10);
                
                // Get form values safely
                const algorithmName = formData.get('algorithmName') || 'Unnamed Algorithm';
                const algorithmDescription = formData.get('algorithmDescription') || '';
                const compressedFile = formData.get('compressedFile');
                const fileName = compressedFile ? compressedFile.name : 'unknown.zip';
                
                // Store the submission data locally
                this.saveSubmission({
                    submission_id: submissionId,
                    method_name: algorithmName,
                    description: algorithmDescription,
                    created_at: new Date().toISOString(),
                    status: 'processing',
                    file_name: fileName
                });
                
                // Show success message
                this.showToast('Algorithm submitted successfully! It will be evaluated shortly.', 'success');
                
                // Simulate faster processing for demo purposes
                setTimeout(() => {
                    this.simulateProcessingCompletion(submissionId);
                }, 5000); // Simulate completion after 5 seconds for demo
                
                return { submission_id: submissionId };
            } else {
                // Real implementation would use a server-side proxy approach
                // Example code for proxy approach:
                
                // Create a new FormData to send to your backend
                const proxyData = new FormData();
                proxyData.append('secret_key', this.secretKey);
                proxyData.append('method_name', formData.get('algorithmName'));
                proxyData.append('file', formData.get('compressedFile'));
                
                if (formData.get('algorithmDescription')) {
                    proxyData.append('description', formData.get('algorithmDescription'));
                }
                
                // Make the API call through your backend proxy
                const response = await fetch('/api/proxy/codabench/submit', {
                    method: 'POST',
                    body: proxyData
                });
                
                if (!response.ok) {
                    throw new Error(`Submission failed: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Store the submission ID for future reference
                this.saveSubmissionId(data.submission_id);
                
                // Show success message
                this.showToast('Algorithm submitted successfully! It will be evaluated shortly.', 'success');
                
                return data;
            }
        } catch (error) {
            console.error('Error submitting algorithm:', error);
            this.showToast(`Submission error: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Poll for submission results
     * @param {string} submissionId The submission ID to check
     * @returns {Promise} Promise with results data
     */
    async pollForResults(submissionId) {
        try {
            if (this.useLocalMock) {
                // Simulate API call with mock response
                await this.simulateNetworkDelay();
                
                // Get saved submission and simulate processing
                const submissions = this.getSavedSubmissions();
                const submission = submissions.find(s => s.submission_id === submissionId);
                
                if (!submission) {
                    throw new Error('Submission not found');
                }
                
                // 30% chance of being completed after each check (for demo purposes)
                if (submission.status === 'processing' && Math.random() > 0.7) {
                    // Mark as completed and add random metrics
                    submission.status = 'completed';
                    submission.metrics = {
                        CR: (Math.random() * 40 + 10).toFixed(2), // 10-50 range
                        PRD: (Math.random() * 0.05).toFixed(4),  // 0-0.05 range
                        Score: (Math.random() * 80 + 20).toFixed(2) // 20-100 range
                    };
                    
                    // Save updated submission
                    this.saveSubmissions(submissions);
                }
                
                return submission;
            } else {
                // Real implementation would use a server-side proxy approach
                const response = await fetch(`/api/proxy/codabench/results/${submissionId}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to get results: ${response.statusText}`);
                }
                
                return await response.json();
            }
        } catch (error) {
            console.error('Error checking results:', error);
            throw error;
        }
    }

    /**
     * Get all submission results for current user
     * @returns {Promise} Promise with all results data
     */
    async getUserSubmissions() {
        try {
            if (this.useLocalMock) {
                // Simulate API call with mock response
                await this.simulateNetworkDelay();
                
                // Return saved submissions
                return this.getSavedSubmissions();
            } else {
                // Real implementation would use a server-side proxy approach
                const response = await fetch('/api/proxy/codabench/my-submissions');
                
                if (!response.ok) {
                    throw new Error(`Failed to get user submissions: ${response.statusText}`);
                }
                
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching user submissions:', error);
            this.showToast(`Failed to load your submissions: ${error.message}`, 'error');
            return [];
        }
    }

    /**
     * Simulate network delay for mock API calls
     * @param {number} ms Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    simulateNetworkDelay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Extract the secret key from the Codabench URL
     * @param {string} url The secret URL
     * @returns {string} The extracted secret key
     */
    extractSecretKey(url) {
        const regex = /secret_key=([^&]+)/;
        const match = url?.match(regex);
        return match ? match[1] : '';
    }

    /**
     * Save submission ID to local storage
     * @param {string} submissionId The submission ID
     */
    saveSubmissionId(submissionId) {
        // Get existing IDs
        const existingIds = JSON.parse(localStorage.getItem('codabenchSubmissionIds') || '[]');
        
        // Add new ID
        existingIds.push({
            id: submissionId,
            timestamp: Date.now()
        });
        
        // Save back to local storage
        localStorage.setItem('codabenchSubmissionIds', JSON.stringify(existingIds));
    }

    /**
     * Save submission data to local storage
     * @param {Object} submission The submission data
     */
    saveSubmission(submission) {
        const submissions = this.getSavedSubmissions();
        submissions.push(submission);
        this.saveSubmissions(submissions);
    }

    /**
     * Get saved submissions from local storage
     * @returns {Array} Array of saved submissions
     */
    getSavedSubmissions() {
        return JSON.parse(localStorage.getItem('codabenchSubmissions') || '[]');
    }

    /**
     * Save submissions to local storage
     * @param {Array} submissions Array of submissions
     */
    saveSubmissions(submissions) {
        localStorage.setItem('codabenchSubmissions', JSON.stringify(submissions));
    }

    /**
     * Show a toast notification
     * @param {string} message The message to show
     * @param {string} type The notification type (success, error, info)
     */
    showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = `toast ${type}`;
            document.body.appendChild(toast);
        } else {
            toast.className = `toast ${type}`;
        }

        // Set message and show
        toast.innerHTML = `
            <div class="toast-icon">${this.getToastIcon(type)}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        // Add event listener to close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.display = 'none';
        });
        
        // Show toast
        toast.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }

    /**
     * Get the appropriate icon for the toast type
     * @param {string} type The notification type
     * @returns {string} The icon HTML
     */
    getToastIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }

    /**
     * Simulate the completion of algorithm processing for demo purposes
     * @param {string} submissionId The submission ID to update
     */
    async simulateProcessingCompletion(submissionId) {
        const submissions = this.getSavedSubmissions();
        const submission = submissions.find(s => s.submission_id === submissionId);
        
        if (!submission) return;
        
        // Mark as completed and add metrics
        submission.status = 'completed';
        submission.metrics = {
            CR: (Math.random() * 40 + 10).toFixed(2),      // 10-50 range
            PRD: (Math.random() * 0.05).toFixed(4),        // 0-0.05 range
            Score: (Math.random() * 80 + 20).toFixed(2)    // 20-100 range
        };
        
        // Save updated submission
        this.saveSubmissions(submissions);
        
        // Show notification
        this.showToast('Results for your algorithm are ready! Check the My Submissions section.', 'success');
        
        // Update submissions display if function exists
        if (typeof updateSubmissionsSection === 'function') {
            updateSubmissionsSection();
        }
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Codabench integration
    const codabench = new CodabenchIntegration();
    
    // Handle form submission
    const form = document.getElementById('algorithmSubmissionForm');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            try {
                // Validate form
                if (!validateSubmissionForm()) {
                    return;
                }
                
                // Disable form elements to prevent double submission
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    const originalText = submitButton.textContent;
                    submitButton.textContent = 'Submitting...';
                    submitButton.disabled = true;
                }
                
                // Create FormData object
                const formData = new FormData(form);
                
                try {
                    // Submit to Codabench
                    const result = await codabench.submitAlgorithm(formData);
                    
                    // Start polling for results
                    if (result && result.submission_id) {
                        pollResults(result.submission_id);
                    }
                    
                    // Clear form after successful submission
                    form.reset();
                    
                    // Reset file upload UI elements
                    resetFileUploadUI('paperFile');
                    resetFileUploadUI('compressedFile');
                    
                    // Update submissions section if it exists
                    updateSubmissionsSection();
                } catch (error) {
                    console.error('Submission failed:', error);
                    codabench.showToast(`Submission failed: ${error.message}`, 'error');
                } finally {
                    // Re-enable form elements
                    if (submitButton) {
                        submitButton.textContent = 'Submit Entry';
                        submitButton.disabled = false;
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                codabench.showToast('An unexpected error occurred. Please try again.', 'error');
            }
        });
    }
    
    // Function to reset file upload UI
    function resetFileUploadUI(inputId) {
        const filePreview = document.getElementById(`${inputId}Preview`);
        const fileUpload = document.getElementById(inputId)?.closest('.file-upload');
        const uploadMessage = fileUpload?.querySelector('.upload-message');
        
        if (filePreview) filePreview.style.display = 'none';
        if (fileUpload) fileUpload.classList.remove('has-file');
        if (uploadMessage) {
            uploadMessage.textContent = `Click to upload ${inputId === 'paperFile' ? 'PDF' : 'ZIP'} file`;
        }
    }
    
    // Function to poll for results
    async function pollResults(submissionId) {
        // Poll every 10 seconds for 5 minutes
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts * 10 seconds = 5 minutes
        
        const pollInterval = setInterval(async () => {
            try {
                const result = await codabench.pollForResults(submissionId);
                
                // If results are ready, display them
                if (result.status === 'completed') {
                    clearInterval(pollInterval);
                    
                    // Display results
                    codabench.showToast('Results are ready! Check the My Submissions section.', 'success');
                    updateSubmissionsSection();
                }
                
                // Stop polling after maximum attempts
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    codabench.showToast('Still processing. Check back later in My Submissions.', 'info');
                }
            } catch (error) {
                clearInterval(pollInterval);
                console.error('Error polling results:', error);
            }
        }, 10000); // Poll every 10 seconds
    }
    
    // Function to update the My Submissions section
    async function updateSubmissionsSection() {
        const submissionHistory = document.getElementById('submissionHistory');
        if (!submissionHistory) return;
        
        try {
            // Clear current content
            submissionHistory.innerHTML = '<div class="loading">Loading your submissions...</div>';
            
            // Get user submissions
            const submissions = await codabench.getUserSubmissions();
            
            // Clear loading message
            submissionHistory.innerHTML = '';
            
            // Display submissions
            if (submissions.length === 0) {
                submissionHistory.innerHTML = '<p>You have not submitted any algorithms yet.</p>';
                return;
            }
            
            // Update highest score and total submissions
            document.getElementById('highScore').textContent = getHighestScore(submissions);
            document.getElementById('totalSubmissions').textContent = submissions.length;
            
            // Add each submission
            submissions.forEach(submission => {
                const card = document.createElement('div');
                card.className = 'submission-card';
                
                const status = submission.status === 'completed' ? 'Completed' : 'Processing';
                const statusClass = submission.status === 'completed' ? 'status-success' : 'status-processing';
                
                card.innerHTML = `
                    <h3>${submission.method_name}</h3>
                    <p><strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="${statusClass}">${status}</span></p>
                    ${submission.status === 'completed' && submission.metrics ? `
                        <p><strong>CR:</strong> ${parseFloat(submission.metrics.CR).toFixed(2)}</p>
                        <p><strong>PRD:</strong> ${parseFloat(submission.metrics.PRD).toFixed(4)}</p>
                        <p><strong>Score:</strong> ${parseFloat(submission.metrics.Score).toFixed(2)}</p>
                    ` : ''}
                `;
                
                submissionHistory.appendChild(card);
            });
        } catch (error) {
            console.error('Error updating submissions:', error);
            submissionHistory.innerHTML = '<p>Failed to load submissions. Please try again later.</p>';
        }
    }
    
    // Function to get highest score from submissions
    function getHighestScore(submissions) {
        if (!submissions || submissions.length === 0) return '0';
        
        return submissions.reduce((max, sub) => {
            if (sub.status === 'completed' && sub.metrics && parseFloat(sub.metrics.Score) > max) {
                return parseFloat(sub.metrics.Score);
            }
            return max;
        }, 0).toFixed(2);
    }
    
    // Function to validate the submission form
    function validateSubmissionForm() {
        try {
            // Check algorithm name
            const algorithmName = document.getElementById('algorithmName');
            if (!algorithmName || !algorithmName.value.trim()) {
                codabench.showToast('Please enter an algorithm name.', 'error');
                return false;
            }
            
            // Check submission type if paper is required
            const paperSubmissionType = document.getElementById('paperSubmissionType');
            if (paperSubmissionType && paperSubmissionType.value) {
                if (paperSubmissionType.value === 'file') {
                    const paperFile = document.getElementById('paperFile');
                    if (!paperFile || !paperFile.files || paperFile.files.length === 0) {
                        codabench.showToast('Please select a PDF file for your paper.', 'error');
                        return false;
                    }
                } else if (paperSubmissionType.value === 'link') {
                    const paperLink = document.getElementById('paperLink');
                    if (!paperLink || !paperLink.value.trim()) {
                        codabench.showToast('Please provide a link to your paper.', 'error');
                        return false;
                    }
                }
            }
            
            // Algorithm description is optional, no need to validate
            
            // Check algorithm implementation file
            const fileInput = document.getElementById('compressedFile');
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                codabench.showToast('Please select a ZIP file containing your algorithm implementation.', 'error');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Validation error:', error);
            codabench.showToast('An error occurred during form validation. Please try again.', 'error');
            return false;
        }
    }
    
    // Load user submissions if on the submissions page
    if (document.getElementById('submissions')) {
        updateSubmissionsSection();
    }
}); 