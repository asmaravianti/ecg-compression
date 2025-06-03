// Forum data structure
let forumPosts = [
    {
        id: 1,
        title: "Dataset Format Clarification",
        author: "User123",
        timestamp: "2024-03-10T10:30:00",
        content: "Can someone clarify the expected format for the reconstructed signals? Should they match the original sampling rate exactly?",
        replies: [
            {
                id: 1,
                author: "Admin",
                timestamp: "2024-03-10T11:15:00",
                content: "Yes, the reconstructed signals must match the original sampling rate of 360 Hz exactly. This ensures fair comparison across all submissions."
            }
        ],
        replyCount: 1
    },
    {
        id: 2,
        title: "Evaluation Metrics Discussion",
        author: "Admin",
        timestamp: "2024-03-09T15:45:00",
        content: "Please ensure your submissions meet the evaluation criteria. New guidelines have been posted in the documentation.",
        replies: [
            {
                id: 1,
                author: "DataMasters",
                timestamp: "2024-03-09T16:30:00",
                content: "Could you highlight the key changes in the new guidelines?"
            },
            {
                id: 2,
                author: "Admin",
                timestamp: "2024-03-09T17:00:00",
                content: "The main changes include: 1) Updated PRD calculation method, 2) New minimum compression ratio requirement, and 3) Additional validation steps for reconstructed signals."
            }
        ],
        replyCount: 2
    },
    {
        id: 3,
        title: "Best Practices for Signal Compression",
        author: "SignalPros",
        timestamp: "2024-03-08T09:15:00",
        content: "We've found that preprocessing the ECG signals before compression can significantly improve results. Here are some tips...",
        replies: [
            {
                id: 1,
                author: "EcgExperts",
                timestamp: "2024-03-08T10:00:00",
                content: "Great insights! We've also noticed that noise reduction is crucial."
            }
        ],
        replyCount: 1
    }
];

// Sort posts by reply count (for home page preview)
function getMostDiscussedPosts(limit = 2) {
    return [...forumPosts]
        .sort((a, b) => b.replyCount - a.replyCount)
        .slice(0, limit);
}

// Sort posts by date (for home page preview)
function getMostRecentPosts(limit = 2) {
    return [...forumPosts]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}

// Format timestamp to relative time
function formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7) {
        return date.toLocaleDateString();
    } else if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// Update forum preview on home page
function updateForumPreview() {
    const forumContainer = document.getElementById('forumContainer');
    if (!forumContainer) return;

    const recentPosts = getMostRecentPosts(2);
    
    forumContainer.innerHTML = recentPosts.map(post => `
        <div class="forum-post interactive-hover" data-post-id="${post.id}">
            <h3>${post.title}</h3>
            <p><strong>Posted by:</strong> ${post.author} | 🕐 ${formatRelativeTime(post.timestamp)}</p>
            <p>${post.content}</p>
            <div class="forum-post-stats">
                <span>💬 ${post.replyCount} ${post.replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
            <button class="btn btn-primary reply-btn" onclick="showReplyForm(${post.id})">💬 Reply</button>
        </div>
    `).join('');
}

// Show full forum view
function showFullForum() {
    const forumContainer = document.getElementById('forumContainer');
    if (!forumContainer) return;

    forumContainer.innerHTML = forumPosts.map(post => `
        <div class="forum-post interactive-hover" data-post-id="${post.id}">
            <h3>${post.title}</h3>
            <p><strong>Posted by:</strong> ${post.author} | 🕐 ${formatRelativeTime(post.timestamp)}</p>
            <p>${post.content}</p>
            
            <div class="replies-section">
                ${post.replies.map(reply => `
                    <div class="reply">
                        <p><strong>${reply.author}</strong> | 🕐 ${formatRelativeTime(reply.timestamp)}</p>
                        <p>${reply.content}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="forum-post-stats">
                <span>💬 ${post.replyCount} ${post.replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
            
            <button class="btn btn-primary reply-btn" onclick="showReplyForm(${post.id})">💬 Reply</button>
            
            <div class="reply-form" id="replyForm-${post.id}" style="display: none;">
                <textarea placeholder="Write your reply..." class="reply-textarea"></textarea>
                <button class="btn btn-primary" onclick="submitReply(${post.id})">Submit Reply</button>
            </div>
        </div>
    `).join('');
}

// Show reply form
function showReplyForm(postId) {
    if (!getAuthToken()) {
        alert('Please login to reply to posts');
        openModal('authModal');
        showForm('login');
        return;
    }

    const replyForm = document.getElementById(`replyForm-${postId}`);
    if (replyForm) {
        replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
    }
}

// Submit reply
function submitReply(postId) {
    const replyForm = document.getElementById(`replyForm-${postId}`);
    if (!replyForm) return;

    const textarea = replyForm.querySelector('.reply-textarea');
    if (!textarea || !textarea.value.trim()) {
        alert('Please write a reply before submitting');
        return;
    }

    const post = forumPosts.find(p => p.id === postId);
    if (post) {
        const newReply = {
            id: post.replies.length + 1,
            author: currentTeam || 'Anonymous',
            timestamp: new Date().toISOString(),
            content: textarea.value.trim()
        };

        post.replies.push(newReply);
        post.replyCount++;

        // Update the display
        if (document.getElementById('forum').style.display !== 'none') {
            showFullForum();
        } else {
            updateForumPreview();
        }

        // Clear the form
        textarea.value = '';
        replyForm.style.display = 'none';
    }
} 