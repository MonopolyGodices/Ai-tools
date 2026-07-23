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
                // Populate UI
                document.getElementById('userName').innerText = userData.name;
                document.getElementById('userCredits').innerText = userData.credits;
                document.querySelector('.avatar').innerText = userData.name.charAt(0).toUpperCase();

                // Populate Settings Form
                document.getElementById('settingsName').value = userData.name;
                document.getElementById('settingsEmail').value = userData.email;

                // Populate Stats
                document.getElementById('statCredits').innerText = userData.credits;
                const history = JSON.parse(localStorage.getItem('nexusHistory') || '[]');
                document.getElementById('statGens').innerText = history.length;
                document.getElementById('statMember').innerText = userData.credits > 50 ? 'Pro' : 'Starter';
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

        // Save Profile Changes
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('settingsName').value;
            const newEmail = document.getElementById('settingsEmail').value;
            const newPassword = document.getElementById('settingsPassword').value;

            const btn = document.querySelector('.btn-save');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            const promises = [];

            if (newEmail !== user.email) {
                promises.push(user.updateEmail(newEmail));
            }

            if (newPassword.trim() !== '') {
                promises.push(user.updatePassword(newPassword));
            }

            promises.push(db.collection('users').doc(user.uid).update({
                name: newName,
                email: newEmail
            }));

            Promise.all(promises).then(() => {
                const savedUser = JSON.parse(localStorage.getItem('nexusUser') || '{}');
                savedUser.name = newName;
                savedUser.email = newEmail;
                localStorage.setItem('nexusUser', JSON.stringify(savedUser));

                document.getElementById('userName').innerText = newName;
                document.querySelector('.avatar').innerText = newName.charAt(0).toUpperCase();
                
                showToast('Profile updated successfully!');
                document.getElementById('settingsPassword').value = '';
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Save Changes';
                btn.disabled = false;
            }).catch((error) => {
                showToast(error.message);
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Save Changes';
                btn.disabled = false;
            });
        });
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
        const user = firebase.auth().currentUser;
        if (user) {
            db.collection('users').doc(user.uid).delete().then(() => {
                return user.delete();
            }).then(() => {
                localStorage.removeItem('nexusUser');
                localStorage.removeItem('nexusHistory');
                window.location.href = 'index';
            }).catch((error) => {
                showToast('Error deleting account. Please sign in again to confirm.');
            });
        }
    }
}
