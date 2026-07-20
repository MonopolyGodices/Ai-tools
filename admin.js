// 1. Admin Security Gate
function checkAdminPass() {
    const input = document.getElementById('adminPassInput').value;
    const correctPass = 'nexus-admin-2026'; // بدل هاد الرمز بأي شي بغيتي
    
    if (input === correctPass) {
        document.getElementById('adminGate').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
    } else {
        alert('Wrong Passcode. Access Denied.');
    }
}

// 2. Add Credits to User Account
function addUserCredits(amount) {
    const savedUser = localStorage.getItem('nexusUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        user.credits += amount;
        localStorage.setItem('nexusUser', JSON.stringify(user));
        alert(`Success: ${amount} credits added to your account!`);
    } else {
        alert('Error: No user account found in this browser. Please login first.');
    }
}

// 3. Free Generation (Bypass Credits)
function generateAdmin() {
    const btn = event.currentTarget;
    const status = document.getElementById('adminStatus');
    const loading = document.getElementById('adminLoading');
    const img = document.getElementById('adminPreviewImg');
    const emptyState = document.querySelector('#adminPreviewScreen .empty-state');

    // Hide empty state, show loading
    if(emptyState) emptyState.style.display = 'none';
    img.style.display = 'none';
    loading.classList.add('active');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    status.innerText = 'Processing promo asset...';
    status.style.color = 'var(--accent-2)';

    // Simulate generation (3 seconds)
    setTimeout(() => {
        const seed = Math.floor(Math.random() * 9999);
        img.src = `https://picsum.photos/seed/adminpromo${seed}/800/450.jpg`;
        
        loading.classList.remove('active');
        img.style.display = 'block';
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate (Free)';
        status.innerText = 'Idle · Promo asset generated successfully';
        status.style.color = 'var(--text-dim)';
    }, 3000);
}

// 4. Pills Selection (Aspect Ratio)
document.querySelectorAll('.pills').forEach(group => {
    group.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});
