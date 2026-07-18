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

    // Add Credits Button Logic
    document.getElementById('addCreditsBtn').addEventListener('click', () => {
        showToast('Insufficient balance. Complete CPA offers to earn more credits.');
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

// Custom Model Selector Logic
const selectTrigger = document.getElementById('selectTrigger');
const selectDropdown = document.getElementById('selectDropdown');
const modelSearch = document.getElementById('modelSearch');
const triggerName = document.getElementById('triggerName');
const triggerProvider = document.getElementById('triggerProvider');
const triggerIcon = document.getElementById('triggerIcon');
const modelItems = document.querySelectorAll('.model-item');
const durationGroup = document.getElementById('durationGroup');

selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    selectTrigger.classList.toggle('active');
    selectDropdown.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#customSelect')) {
        selectTrigger.classList.remove('active');
        selectDropdown.classList.remove('active');
    }
});

modelItems.forEach(item => {
    item.addEventListener('click', () => {
        modelItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        triggerName.innerText = item.dataset.name;
        triggerProvider.innerText = item.dataset.provider;
        
        if (item.dataset.type === 'video') {
            triggerIcon.innerHTML = '<i class="fa-solid fa-film"></i>';
            durationGroup.style.display = 'block';
        } else {
            triggerIcon.innerHTML = '<i class="fa-solid fa-image"></i>';
            durationGroup.style.display = 'none';
        }
        
        // Switch tab UI
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${item.dataset.type}"]`).classList.add('active');
        
        selectTrigger.classList.remove('active');
        selectDropdown.classList.remove('active');
    });
});

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

// Pills selection logic
document.querySelectorAll('.pills').forEach(group => {
    group.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});

// Tab switching logic
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const firstModel = document.querySelector(`.model-item[data-type="${tab.dataset.tab}"]`);
        if (firstModel) {
            firstModel.click(); // Trigger the model click to update UI
        }
    });
});

// Generate Logic
const generateBtn = document.getElementById('generateBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const previewImg = document.getElementById('previewImg');
const promptLog = document.getElementById('promptLog');
const statusText = document.querySelector('.status-text');
const emptyState = document.getElementById('emptyState');

generateBtn.addEventListener('click', () => {
    const savedUser = localStorage.getItem('nexusUser');
    if (!savedUser) return;

    const user = JSON.parse(savedUser);
    const cost = 60; // Cost set to 60 to force user to earn credits

    if (user.credits < cost) {
        addLog('Error: Insufficient credits. Balance: ' + user.credits + '/60', 'error');
        statusText.innerText = 'Error · Insufficient credits';
        statusText.style.color = 'var(--accent-3)';
        showToast('Insufficient credits. Please click (+) to earn more.');
        return;
    }

    // Deduct credits
    user.credits -= cost;
    localStorage.setItem('nexusUser', JSON.stringify(user));
    document.getElementById('userCredits').innerText = user.credits;

    // Start Generation
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    emptyState.style.display = 'none';
    previewImg.style.display = 'block';
    loadingOverlay.classList.add('active');
    statusText.innerText = 'Processing...';
    statusText.style.color = 'var(--accent-2)';
    
    const activeModel = document.querySelector('.model-item.active');
    addLog(`> Task started: ${activeModel.dataset.name}`, 'info');
    
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
    generateBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate (Cost: 60 Credits)';
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
