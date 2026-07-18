// Protect Route & Load User Data
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('nexusUser');
    if (!savedUser) { window.location.href = 'auth.html'; return; }
    
    const user = JSON.parse(savedUser);
    document.getElementById('userName').innerText = user.name;
    document.getElementById('userCredits').innerText = user.credits;
    document.querySelector('.avatar').innerText = user.name.charAt(0).toUpperCase();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('nexusUser');
        window.location.href = 'index.html';
    });

    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    document.getElementById('addCreditsBtn').addEventListener('click', () => {
        showToast('Complete tasks below to earn free credits!');
    });

    // Attach event listeners to all Start buttons
    document.querySelectorAll('.btn-task.start').forEach(btn => {
        btn.addEventListener('click', handleStartTask);
    });
});

// Toast Logic
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// 1. Start Task Logic
function handleStartTask(e) {
    const btn = e.currentTarget;
    const taskId = btn.dataset.taskId;
    const duration = parseInt(btn.dataset.duration);
    const reward = parseInt(btn.dataset.reward);
    const url = btn.dataset.url;
    
    const timerText = document.getElementById(`timer-${taskId}`);
    const progressBar = document.getElementById(`bar-${taskId}`);

    // Check if the link is still the placeholder
    if (url.includes('YOUR_OGADS_LINK')) {
        showToast('Error: Admin needs to set the task URL first.');
        return;
    }

    // Open the OGAds Locker in a new tab
    window.open(url, '_blank');
    
    // Disable button and start timer
    btn.classList.remove('start');
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Task in progress...';
    timerText.classList.remove('failed', 'verifying');
    timerText.innerText = 'Complete offers in the opened tab. Verifying...';
    
    let timeLeft = duration;
    progressBar.style.width = '0%';

    const interval = setInterval(() => {
        timeLeft--;
        let progress = ((duration - timeLeft) / duration) * 100;
        progressBar.style.width = `${progress}%`;
        
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        timerText.innerText = `Time remaining: ${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            timerText.innerText = 'Time is up! Click to verify.';
            
            // Change button to Claim
            btn.classList.remove('loading');
            btn.classList.add('claim');
            btn.innerHTML = '<i class="fa-solid fa-gift"></i> Claim Reward';
            
            // Remove old listener and add Verify listener
            btn.removeEventListener('click', handleStartTask);
            btn.addEventListener('click', handleVerifyTask);
        }
    }, 1000);
}

// 2. Verification Logic (The 5-second delay)
function handleVerifyTask(e) {
    const btn = e.currentTarget;
    const taskId = btn.dataset.taskId;
    const timerText = document.getElementById(`timer-${taskId}`);
    const progressBar = document.getElementById(`bar-${taskId}`);

    // Change to Verifying state
    btn.classList.remove('claim');
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying completion...';
    timerText.classList.add('verifying');
    timerText.innerText = 'Checking if offers were completed...';
    btn.disabled = true; // Prevent clicking again

    // Simulate API check for 5 seconds
    setTimeout(() => {
        // Always fail for now (as requested)
        failVerification(btn, taskId, progressBar, timerText);
    }, 5000);
}

// 3. Failure Logic (Reset Task)
function failVerification(btn, taskId, progressBar, timerText) {
    btn.disabled = false;
    
    // Reset button to Start state
    btn.classList.remove('loading');
    btn.classList.add('start');
    btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Retry Task';
    
    // Reset UI
    timerText.classList.remove('verifying');
    timerText.classList.add('failed');
    timerText.innerText = 'Verification failed. Please try again.';
    progressBar.style.width = '0%';
    
    // Show Toast
    showToast('Verification failed. Please complete new tasks properly.');
    
    // Re-attach Start listener for the next attempt
    btn.removeEventListener('click', handleVerifyTask);
    btn.addEventListener('click', handleStartTask);
}
