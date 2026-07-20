// Admin Logic (Free Generation & Credit Control)

// 1. Secret Credit Adder (كليكي على الزر الخفي فووق على اليسار)
function addSecretCredits() {
    const savedUser = localStorage.getItem('nexusUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        user.credits += 1000; // كيزيد 1000 كريديت فكل ضغطة
        localStorage.setItem('nexusUser', JSON.stringify(user));
        document.getElementById('userCredits').innerText = user.credits;
        showToast('1000 Credits Added Successfully!');
    } else {
        // يلا ماكانش حتى حساب، كيصاوب واحد وهمي للأدمن
        const adminUser = { name: 'Admin', email: 'admin@nexusgen.cc', password: 'admin', credits: 9999 };
        localStorage.setItem('nexusUser', JSON.stringify(adminUser));
        document.getElementById('userCredits').innerText = adminUser.credits;
        showToast('Admin Account Initialized!');
    }
}

// Load User Data on start
document.addEventListener('DOMContentLoaded', () => {
    let savedUser = localStorage.getItem('nexusUser');
    if (!savedUser) {
        // يلا دخل للأدمن بلا حساب، كنخليوه يدوز بحال أدمن
        const adminUser = { name: 'Admin', email: 'admin@nexusgen.cc', password: 'admin', credits: 9999 };
        localStorage.setItem('nexusUser', JSON.stringify(adminUser));
        savedUser = localStorage.getItem('nexusUser');
    }
    
    const user = JSON.parse(savedUser);
    document.getElementById('userName').innerText = user.name;
    document.getElementById('userCredits').innerText = user.credits;
    document.querySelector('.avatar').innerText = user.name.charAt(0).toUpperCase();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('nexusUser');
        window.location.href = 'index';
    });

    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    document.getElementById('addCreditsBtn').addEventListener('click', () => {
        addSecretCredits(); // الزر ديال + فووق غادي يزيد كريديت بحال الزر الخفي
    });

    updateCost();
});

// Toast Logic
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// Custom Model Selector (نفس الكود ديال dashboard.js)
const selectTrigger = document.getElementById('selectTrigger');
const selectDropdown = document.getElementById('selectDropdown');
const modelSearch = document.getElementById('modelSearch');
const triggerName = document.getElementById('triggerName');
const triggerProvider = document.getElementById('triggerProvider');
const triggerIcon = document.getElementById('triggerIcon');
const modelItems = document.querySelectorAll('.model-item');
const durationGroup = document.getElementById('durationGroup');
const modeGroup = document.getElementById('modeGroup');
const uploadGroup = document.getElementById('uploadGroup');

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
            modeGroup.style.display = 'block';
        } else {
            triggerIcon.innerHTML = '<i class="fa-solid fa-image"></i>';
            durationGroup.style.display = 'none';
            modeGroup.style.display = 'none';
            uploadGroup.style.display = 'none';
        }
        
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${item.dataset.type}"]`).classList.add('active');
        
        selectTrigger.classList.remove('active');
        selectDropdown.classList.remove('active');
        updateCost();
    });
});

modelSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    modelItems.forEach(item => {
        const name = item.dataset.name.toLowerCase();
        const provider = item.dataset.provider.toLowerCase();
        item.style.display = (name.includes(term) || provider.includes(term)) ? 'flex' : 'none';
    });
});

document.querySelectorAll('.pills').forEach(group => {
    group.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            if (group.id === 'modePills') {
                const mode = e.target.dataset.mode;
                uploadGroup.style.display = (mode === 'i2v') ? 'block' : 'none';
            }
            updateCost();
        }
    });
});

const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const firstModel = document.querySelector(`.model-item[data-type="${tab.dataset.tab}"]`);
        if (firstModel) { firstModel.click(); }
    });
});

document.getElementById('imgUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const uploadLabel = document.getElementById('uploadLabel');
            uploadLabel.innerHTML = `<img src="${event.target.result}" alt="Uploaded"><span>Image ready</span>`;
        };
        reader.readAsDataURL(file);
    }
});

// Cost Calculator (باش يبان بحال الحقيقي)
function calculateCost() {
    const activeModel = document.querySelector('.model-item.active');
    if (!activeModel) return 0;
    const type = activeModel.dataset.type;
    let cost = parseInt(activeModel.dataset.baseCost);
    const resPill = document.querySelector('#resGroup .pill.active');
    cost += parseInt(resPill.dataset.costMod);
    if (type === 'video') {
        const durationPill = document.querySelector('#durationPills .pill.active');
        cost += parseInt(durationPill.dataset.costMod);
        const modePill = document.querySelector('#modePills .pill.active');
        if (modePill.dataset.mode === 'i2v') { cost += 25; }
    }
    return cost;
}

function updateCost() {
    const cost = calculateCost();
    document.getElementById('dynamicCost').innerText = cost;
}

// ⚠️ Generate Logic (Admin Mode - Bypass Credits)
const generateBtn = document.getElementById('generateBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const previewImg = document.getElementById('previewImg');
const promptLog = document.getElementById('promptLog');
const statusText = document.querySelector('.status-text');
const emptyState = document.getElementById('emptyState');

generateBtn.addEventListener('click', handleGenerate);

function handleGenerate() {
    // فالأدمن، مكنحماقوش الكريديت، كنخليوه يصاوب ديريكت
    // Start Generation
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    emptyState.style.display = 'none';
    previewImg.style.display = 'block';
    loadingOverlay.classList.add('active');
    statusText.innerText = 'Processing...';
    statusText.style.color = 'var(--accent-2)';
    
    const activeModel = document.querySelector('.model-item.active');
    const cost = calculateCost();
    addLog(`> Task started: ${activeModel.dataset.name} (Cost: ${cost}cr - Bypassed)`, 'info');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        addLog(`> Diffusing step ${progress}/100...`);
        if (progress >= 100) {
            clearInterval(interval);
            finishGeneration();
        }
    }, 400);
}

function finishGeneration() {
    const activeModel = document.querySelector('.model-item.active');
    addLog(`> Generation complete! Asset delivered.`, 'success');
    
    const seed = Math.floor(Math.random() * 9999);
    const imgUrl = `https://picsum.photos/seed/nexus${seed}/800/450.jpg`;
    previewImg.src = imgUrl;
    
    // Save to Gallery History
    const newAsset = {
        id: Date.now(), url: imgUrl, model: activeModel.dataset.name, type: activeModel.dataset.type,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    let history = JSON.parse(localStorage.getItem('nexusHistory') || '[]');
    history.unshift(newAsset);
    localStorage.setItem('nexusHistory', JSON.stringify(history));
    
    loadingOverlay.classList.remove('active');
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Generate (Cost: <span id="dynamicCost">${calculateCost()}</span> Credits)`;
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
