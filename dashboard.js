// Protect Route & Load User Data
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('nexusUser');
    
    if (!savedUser) {
        window.location.href = 'auth.html';
        return;
    }

    const user = JSON.parse(savedUser);
    
    document.getElementById('userName').innerText = user.name;
    document.getElementById('userCredits').innerText = user.credits;
    document.querySelector('.avatar').innerText = user.name.charAt(0).toUpperCase();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('nexusUser');
        window.location.href = 'index.html';
    });

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
});

// ===== CUSTOM MODEL SELECTOR LOGIC =====
const selectTrigger = document.getElementById('selectTrigger');
const selectDropdown = document.getElementById('selectDropdown');
const selectChevron = document.getElementById('selectChevron');
const modelSearch = document.getElementById('modelSearch');
const triggerName = document.getElementById('triggerName');
const triggerProvider = document.getElementById('triggerProvider');
const triggerIcon = document.getElementById('triggerIcon');
const modelItems = document.querySelectorAll('.model-item');

// Toggle dropdown
selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    selectTrigger.classList.toggle('active');
    selectDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#customSelect')) {
        selectTrigger.classList.remove('active');
        selectDropdown.classList.remove('active');
    }
});

// Select model
modelItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active from all
        modelItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Update trigger
        triggerName.innerText = item.dataset.name;
        triggerProvider.innerText = item.dataset.provider;
        
        // Update icon based on type
        if (item.dataset.type === 'video') {
            triggerIcon.innerHTML = '<i class="fa-solid fa-film"></i>';
        } else {
            triggerIcon.innerHTML = '<i class="fa-solid fa-image"></i>';
        }
        
        // Close dropdown
        selectTrigger.classList.remove('active');
        selectDropdown.classList.remove('active');
        
        // Switch tab if needed
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(t => t.classList.remove('active'));
        if (item.dataset.type === 'video') {
            document.querySelector('[data-tab="video"]').classList.add('active');
        } else {
            document.querySelector('[data-tab="image"]').classList.add('active');
        }
    });
});

// Search functionality
modelSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    modelItems.forEach(item => {
        const name = item.dataset.name.toLowerCase();
        const provider = item.dataset.provider.toLowerCase();
        if (name.includes(term) || provider.includes(term)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Pills selection
const pills = document.querySelectorAll('.pill');
pills.forEach(pill => {
    pill.addEventListener('click', () => {
        const parent = pill.parentElement;
        parent.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
    });
});

// Tab switching
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Auto-select first model of that type
        const firstModel = document.querySelector(`.model-item[data-type="${tab.dataset.tab}"]`);
        if (firstModel) {
            firstModel.click();
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

    if (user.credits < cost) {
        addLog('Error: Insufficient credits. Please complete tasks to earn more.', 'error');
        statusText.innerText = 'Error · Insufficient credits';
        statusText.style.color = 'var(--accent-3)';
        return;
    }

    user.credits -= cost;
    localStorage.setItem('nexusUser', JSON.stringify(user));
    document.getElementById('userCredits').innerText = user.credits;

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    loadingOverlay.classList.add('active');
    statusText.innerText = 'Processing...';
    statusText.style.color = 'var(--accent-2)';
    
    const activeModel = document.querySelector('.model-item.active');
    addLog(`> Task started: ${activeModel.dataset.name} (${activeModel.dataset.provider})`, 'info');
    
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
    const activeModel = document.querySelector('.model-item.active');
    addLog(`> Generation complete! Asset delivered.`, 'success');
    
    const seed = Math.floor(Math.random() * 9999);
    previewImg.src = `https://picsum.photos/seed/nexus${seed}/800/450.jpg`;
    
    loadingOverlay.classList.remove('active');
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate (Cost: 5 Credits)';
    statusText.innerText = `Idle · Last gen: ${activeModel.dataset.name}`;
    statusText.style.color = 'var(--text-dim)';
}

function addLog(message, type = 'info') {
    const div = document.createElement('div');
    div.innerText = message;
    if (type === 'error') div.style.color = 'var(--accent-3)';
    if (type === 'success') div.style.color = 'var(--green)';
    promptLog.appendChild(div);
    promptLog.scrollTop = promptLog.scrollHeight;
}
