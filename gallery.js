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
        showToast('Task system coming soon. Earn credits by completing offers.');
    });

    renderGallery();
});

// Toast Logic
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Render Gallery Items
function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const history = JSON.parse(localStorage.getItem('nexusHistory') || '[]');

    if (history.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-gallery">
                <i class="fa-solid fa-image"></i>
                <h3>Your canvas is empty</h3>
                <p>You haven't generated anything yet. Let's create something extraordinary.</p>
                <button onclick="window.location.href='dashboard.html'" class="btn-generate" style="width: auto; padding: 12px 24px;">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Start Generating
                </button>
            </div>
        `;
        return;
    }

    galleryGrid.innerHTML = history.map(item => `
        <div class="gallery-card">
            <div class="gallery-img-wrapper">
                <img src="${item.url}" alt="Generation">
                <div class="gallery-type-badge">
                    <i class="fa-solid fa-${item.type === 'video' ? 'film' : 'image'}"></i>
                    ${item.type}
                </div>
                <div class="gallery-actions">
                    <button class="action-btn" title="Download" onclick="downloadItem('${item.url}', '${item.type}')"><i class="fa-solid fa-download"></i></button>
                    <button class="action-btn delete" title="Delete" onclick="deleteItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="gallery-info">
                <div class="gallery-model">${item.model}</div>
                <div class="gallery-date">${item.date}</div>
            </div>
        </div>
    `).join('');
}

// Delete Item
function deleteItem(id) {
    let history = JSON.parse(localStorage.getItem('nexusHistory') || '[]');
    history = history.filter(item => item.id !== id);
    localStorage.setItem('nexusHistory', JSON.stringify(history));
    renderGallery();
    showToast('Item deleted successfully.');
}

// Download Item
function downloadItem(url, type) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-${type}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
