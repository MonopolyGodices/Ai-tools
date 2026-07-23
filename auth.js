// Tab Switching
function switchTab(tab) {
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const signinTab = document.getElementById('signinTab');
    const signupTab = document.getElementById('signupTab');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');

    if (tab === 'signin') {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        formTitle.innerText = 'Sign in';
        formSubtitle.innerText = 'Welcome back. Let\'s create something extraordinary.';
    } else {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
        signinTab.classList.remove('active');
        signupTab.classList.add('active');
        formTitle.innerText = 'Create account';
        formSubtitle.innerText = 'Start with 50 free credits. No card required.';
    }
}

// Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Sign Up with Firebase
function handleSignUp(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';
    btn.disabled = true;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Create Firestore user document
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                credits: 50,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            // Bridge: also set localStorage for gallery.js/settings.js compatibility
            localStorage.setItem('nexusUser', JSON.stringify({ name: name, email: email, credits: 50 }));
            window.location.href = 'dashboard';
        })
        .catch((error) => {
            showToast(error.message);
            btn.innerHTML = 'Create Account <i class="fa-solid fa-arrow-right"></i>';
            btn.disabled = false;
        });
}

// Sign In with Firebase
function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Get user data from Firestore
            return db.collection('users').doc(user.uid).get();
        })
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                // Bridge: also set localStorage
                localStorage.setItem('nexusUser', JSON.stringify({ 
                    name: userData.name, 
                    email: userData.email, 
                    credits: userData.credits 
                }));
            }
            window.location.href = 'dashboard';
        })
        .catch((error) => {
            showToast(error.message);
            btn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right"></i>';
            btn.disabled = false;
        });
}

// Google Sign-In
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const userRef = db.collection('users').doc(user.uid);
            
            return userRef.get().then((doc) => {
                if (!doc.exists) {
                    // New user - create document
                    return userRef.set({
                        name: user.displayName || 'User',
                        email: user.email,
                        credits: 50,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        localStorage.setItem('nexusUser', JSON.stringify({ 
                            name: user.displayName || 'User', 
                            email: user.email, 
                            credits: 50 
                        }));
                    });
                } else {
                    // Existing user - update localStorage
                    const userData = doc.data();
                    localStorage.setItem('nexusUser', JSON.stringify({ 
                        name: userData.name, 
                        email: userData.email, 
                        credits: userData.credits 
                    }));
                }
            });
        })
        .then(() => {
            window.location.href = 'dashboard';
        })
        .catch((error) => {
            showToast(error.message);
        });
}

// Auto-redirect if already logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Check if we have localStorage data, if not fetch it
        if (!localStorage.getItem('nexusUser')) {
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    localStorage.setItem('nexusUser', JSON.stringify({ 
                        name: userData.name, 
                        email: userData.email, 
                        credits: userData.credits 
                    }));
                }
                window.location.href = 'dashboard';
            });
        }
    }
});

// Password Toggle
document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = e.currentTarget.previousElementSibling;
        const icon = e.currentTarget.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});
