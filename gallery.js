// Protect Route & Load User Data
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'auth';
            return;
        }

        // Load user data
        db.collection('users').doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                document.getElementById('userName').innerText = userData.name;
                document.getElementById('userCredits').innerText = userData.credits;
                document.querySelector('.avatar').innerText = userData.name.charAt(0).toUpperCase();
                localStorage.setItem('nexusUser', JSON.stringify(userData));
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
            window.location.href = 'tasks';
        });

        renderGallery();
    });
});

// Toast Logic
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Render Gallery Items (Firebase + LocalStorage)
function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');

    // 1. جلب التصاور اللي صاوب المستخدم (LocalStorage)
    const localHistory = JSON.parse(localStorage.getItem('nexusHistory') || '[]');

    // 2. جلب التصاور الرسمية من Firebase
    db.collection('gallery').get().then((querySnapshot) => {
        let firebaseGallery = [];
        querySnapshot.forEach((doc) => {
            firebaseGallery.push(doc.data());
        });

        // 3. دمج التصاور (الفايربيس فوق باش يبانو أول حاجة)
        let allItems = [...firebaseGallery, ...localHistory];

        if (allItems.length === 0) {
            galleryGrid.innerHTML = `
                <div class="empty-gallery">
                    <i class="fa-solid fa-image"></i>
                    <h3>Your canvas is empty</h3>
                    <p>You haven't generated anything yet. Let's create something extraordinary.</p>
                    <button onclick="window.location.href='dashboard'" class="btn-generate" style="width: auto; padding: 12px 24px;">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Start Generating
                    </button>
                </div>
            `;
            return;
        }

        galleryGrid.innerHTML = allItems.map(item => `
            <div class="gallery-card">
                <div class="gallery-img-wrapper">
                    ${item.type === 'video' ? 
                        `<video src="${item.url}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>` : 
                        `<img src="${item.url}" alt="Generation">`
                    }
                    <div class="gallery-type-badge">
                        <i class="fa-solid fa-${item.type === 'video' ? 'film' : 'image'}"></i>
                        ${item.type}
                    </div>
                    <div class="gallery-actions">
                        <button class="action-btn" title="Open" onclick="window.open('${item.url}', '_blank')"><i class="fa-solid fa-up-right-from-square"></i></button>
                        <button class="action-btn delete" title="Delete" onclick="deleteItem('${item.id || ''}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="gallery-info">
                    <div class="gallery-model">${item.model}</div>
                    <div class="gallery-date">${item.date}</div>
                </div>
            </div>
        `).join('');
    }).catch((error) => {
        console.error("Error fetching gallery: ", error);
    });
}

// Delete Item (Local Only for user generated)
function deleteItem(id) {
    if (!id) {
        showToast('Official showcase items cannot be deleted.');
        return;
    }
    let history = JSON.parse(localStorage.getItem('nexusHistory') || '[]');
    history = history.filter(item => item.id != id);
    localStorage.setItem('nexusHistory', JSON.stringify(history));
    renderGallery();
    showToast('Item deleted successfully.');
}
