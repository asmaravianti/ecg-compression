// Form Validation
document.getElementById('submissionForm').addEventListener('submit', (e) => {
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