// Protect Route & Load User Data
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('nexusUser');
    
    // If no user found, redirect to auth
    if (!savedUser) {
        window.location.href = 'auth.html';
        return;
    }

    const user = JSON.parse(savedUser);
    
    // Populate UI
    document.getElementById('userName').innerText = user.name;
    document.getElementById('userCredits').innerText = user.credits;
    document.querySelector('.avatar').innerText = user.name.charAt(0).toUpperCase();

    // Logout Logic
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('nexusUser');
        window.location.href = 'index.html';
    });

    // Mobile Sidebar Toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
});

// UI Interactions
const pills = document.querySelectorAll('.pill');
pills.forEach(pill => {
    pill.addEventListener('click', () => {
        // Remove active from siblings
        const parent = pill.parentElement;
        parent.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
    });
});

// Tab Switching
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const modelSelect = document.getElementById('modelSelect');
        if(tab.dataset.tab === 'video') {
            modelSelect.selectedIndex = 0; // First video model
        } else {
            modelSelect.selectedIndex = 6; // First image model (Nano Banana Pro)
        }
    });
});

// Generate Logic
const generateBtn = document.getElementById('generateBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const previewImg = document.getElementById('previewImg');
const promptLog = document.getElementById('promptLog');
const statusText = document.querySelector('.status-text');

generateBtn.addEventListener('click', () => {
    const savedUser = localStorage.getItem('nexusUser');
    if (!savedUser) return;

    const user = JSON.parse(savedUser);
    const cost = 5;

    // Check credits
    if (user.credits < cost) {
        addLog('Error: Insufficient credits. Please complete tasks to earn more.', 'error');
        statusText.innerText = 'Error · Insufficient credits';
        statusText.style.color = 'var(--accent-3)';
        return;
    }

    // Deduct credits
    user.credits -= cost;
    localStorage.setItem('nexusUser', JSON.stringify(user));
    document.getElementById('userCredits').innerText = user.credits;

    // Start generation process
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    loadingOverlay.classList.add('active');
    statusText.innerText = 'Processing...';
    statusText.style.color = 'var(--accent-2)';
    
    addLog(`> Task started: ${document.getElementById('modelSelect').value}`, 'info');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        addLog(`> Diffusing step ${progress}/100...`);
        if (progress >= 100) {
            clearInterval(interval);
            finishGeneration();
        }
    }, 400);
});

function finishGeneration() {
    const model = document.getElementById('modelSelect').value.split(' — ')[0];
    addLog(`> Generation complete! Asset delivered.`, 'success');
    
    // Change image randomly to simulate new generation
    const seed = Math.floor(Math.random() * 9999);
    previewImg.src = `https://picsum.photos/seed/nexus${seed}/800/450.jpg`;
    
    loadingOverlay.classList.remove('active');
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate (Cost: 5 Credits)';
    statusText.innerText = `Idle · Last gen: ${model}`;
    statusText.style.color = 'var(--text-dim)';
}

// Logger
function addLog(message, type = 'info') {
    const div = document.createElement('div');
    div.innerText = message;
    if (type === 'error') div.style.color = 'var(--accent-3)';
    if (type === 'success') div.style.color = 'var(--green)';
    promptLog.appendChild(div);
    promptLog.scrollTop = promptLog.scrollHeight;
}
