// Protect Route & Load User Data
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('nexusUser');
    if (!savedUser) { window.location.href = 'auth.html'; return; }
    
    const user = JSON.parse(savedUser);
    
    // Populate UI
    document.getElementById('userName').innerText = user.name;
    document.getElementById('userCredits').innerText = user.credits;
    document.querySelector('.avatar').innerText = user.name.charAt(0).toUpperCase();

    // Populate Settings Form
    document.getElementById('settingsName').value = user.name;
    document.getElementById('settingsEmail').value = user.email;

    // Populate Stats
    document.getElementById('statCredits').innerText = user.credits;
    const history = JSON.parse(localStorage.getItem('nexusHistory') || '[]');
    document.getElementById('statGens').innerText = history.length;
    document.getElementById('statMember').innerText = user.credits > 50 ? 'Pro' : 'Starter';

    // Event Listeners
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('nexusUser');
        window.location.href = 'index.html';
    });

    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Redirect + button to tasks page
    document.getElementById('addCreditsBtn').addEventListener('click', () => {
        window.location.href = 'tasks.html';
    });

    // Save Profile Changes
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('settingsName').value;
        const newEmail = document.getElementById('settingsEmail').value;
        const newPassword = document.getElementById('settingsPassword').value;

        user.name = newName;
        user.email = newEmail;
        if (newPassword.trim() !== '') {
            user.password = newPassword; // Update password if provided
        }

        localStorage.setItem('nexusUser', JSON.stringify(user));
        document.getElementById('userName').innerText = user.name;
        document.querySelector('.avatar').innerText = user.name.charAt(0).toUpperCase();
        
        showToast('Profile updated successfully!');
        document.getElementById('settingsPassword').value = ''; // Clear password field
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

// Clear Gallery History
function clearGallery() {
    if (confirm('Are you sure you want to delete all your generated content? This cannot be undone.')) {
        localStorage.removeItem('nexusHistory');
        document.getElementById('statGens').innerText = '0';
        showToast('Gallery history cleared.');
    }
}

// Delete Account
function deleteAccount() {
    if (confirm('Are you absolutely sure? This will permanently delete your account and all data.')) {
        localStorage.removeItem('nexusUser');
        localStorage.removeItem('nexusHistory');
        window.location.href = 'index.html'; // Redirect to landing page
    }
}
