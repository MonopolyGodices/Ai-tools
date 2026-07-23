// Protect Route & Load User Data
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'auth';
            return;
        }

        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                document.getElementById('userName').innerText = userData.name;
                document.getElementById('userCredits').innerText = userData.credits;
                document.querySelector('.avatar').innerText = userData.name.charAt(0).toUpperCase();
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            firebase.auth().signOut().then(() => {
                localStorage.removeItem('nexusUser');
                window.location.href = 'auth';
            });
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

    if (url.includes('YOUR_OGADS_LINK')) {
        showToast('Error: Admin needs to set the task URL first.');
        return;
    }

    window.open(url, '_blank');
    
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
            
            btn.classList.remove('loading');
            btn.classList.add('claim');
            btn.innerHTML = '<i class="fa-solid fa-gift"></i> Claim Reward';
            
            btn.removeEventListener('click', handleStartTask);
            btn.addEventListener('click', handleVerifyTask);
        }
    }, 1000);
}

// 2. Verification Logic
function handleVerifyTask(e) {
    const btn = e.currentTarget;
    const taskId = btn.dataset.taskId;
    const timerText = document.getElementById(`timer-${taskId}`);
    const progressBar = document.getElementById(`bar-${taskId}`);

    btn.classList.remove('claim');
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying completion...';
    timerText.classList.add('verifying');
    timerText.innerText = 'Checking if offers were completed...';
    btn.disabled = true;

    setTimeout(() => {
        failVerification(btn, taskId, progressBar, timerText);
    }, 5000);
}

// 3. Failure Logic
function failVerification(btn, taskId, progressBar, timerText) {
    btn.disabled = false;
    
    btn.classList.remove('loading');
    btn.classList.add('start');
    btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Retry Task';
    
    timerText.classList.remove('verifying');
    timerText.classList.add('failed');
    timerText.innerText = 'Verification failed. Please try again.';
    progressBar.style.width = '0%';
    
    showToast('Verification failed. Please complete new tasks properly.');
    
    btn.removeEventListener('click', handleVerifyTask);
    btn.addEventListener('click', handleStartTask);
}
