// 1. Admin Security Gate
const ADMIN_EMAIL = "Hwlwmhmd724@gmail.com"; // الإيميل ديالك

firebase.auth().onAuthStateChanged((user) => {
    const gate = document.getElementById('adminGate');
    const gateBox = document.getElementById('gateBox');
    const panel = document.getElementById('adminPanel');

    if (user) {
        // User is logged in, check if they are admin
        if (user.email === ADMIN_EMAIL) {
            // Access Granted
            gate.style.display = 'none';
            panel.style.display = 'block';
        } else {
            // Not Admin
            gateBox.innerHTML = `
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
                <a href="dashboard" class="btn-submit" style="display: inline-block; margin-top: 20px; text-decoration: none; background: var(--accent); color: #fff; padding: 12px 24px; border-radius: 8px;">Back to Dashboard</a>
            `;
            gate.style.display = 'flex';
            panel.style.display = 'none';
        }
    } else {
        // Not logged in
        gateBox.innerHTML = `
            <h2>Authentication Required</h2>
            <p>Please sign in to access the admin console.</p>
            <a href="auth" class="btn-submit" style="display: inline-block; margin-top: 20px; text-decoration: none; background: var(--accent); color: #fff; padding: 12px 24px; border-radius: 8px;">Sign In</a>
        `;
        gate.style.display = 'flex';
        panel.style.display = 'none';
    }
});

// 2. Add Credits to Admin Account (Firestore)
function addAdminCredits(amount) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userRef = db.collection('users').doc(user.uid);
    
    db.runTransaction((transaction) => {
        return transaction.get(userRef).then((doc) => {
            if (!doc.exists) {
                throw "Document does not exist!";
            }
            const newCredits = (doc.data().credits || 0) + amount;
            transaction.update(userRef, { credits: newCredits });
            return newCredits;
        });
    }).then((newCredits) => {
        // Update LocalStorage for dashboard compatibility
        const savedUser = JSON.parse(localStorage.getItem('nexusUser') || '{}');
        savedUser.credits = newCredits;
        localStorage.setItem('nexusUser', JSON.stringify(savedUser));
        
        alert(`Success: ${amount} credits added to your account! Total: ${newCredits}`);
    }).catch((error) => {
        console.error("Error adding credits: ", error);
        alert("Error adding credits. Please try again.");
    });
}

// 3. Free Generation (Bypass Credits)
function generateAdmin() {
    const btn = event.currentTarget;
    const status = document.getElementById('adminStatus');
    const loading = document.getElementById('adminLoading');
    const img = document.getElementById('adminPreviewImg');
    const emptyState = document.querySelector('#adminPreviewScreen .empty-state');

    if(emptyState) emptyState.style.display = 'none';
    img.style.display = 'none';
    loading.style.display = 'flex';
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    status.innerText = 'Processing promo asset...';
    status.style.color = 'var(--accent-2)';

    setTimeout(() => {
        const seed = Math.floor(Math.random() * 9999);
        img.src = `https://picsum.photos/seed/adminpromo${seed}/800/450.jpg`;
        
        loading.style.display = 'none';
        img.style.display = 'block';
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate (Free)';
        status.innerText = 'Idle · Promo asset generated successfully';
        status.style.color = 'var(--text-dim)';
    }, 3000);
}

// 4. Pills Selection (Aspect Ratio)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pills').forEach(group => {
        group.addEventListener('click', (e) => {
            if (e.target.classList.contains('pill')) {
                group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    });
});
