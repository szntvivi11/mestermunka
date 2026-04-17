document.addEventListener('DOMContentLoaded', () => {

    // Hamburger menü
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
    if (hamburgerBtn && mobileNavDrawer) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('open');
            mobileNavDrawer.classList.toggle('open');
        });
    }

    // Állapot váltók
    function showState(id) {
        ['state-loading', 'state-invalid', 'state-form', 'state-success'].forEach(s => {
            document.getElementById(s).style.display = s === id ? 'block' : 'none';
        });
    }

    // Password toggle
    function initToggle(inputId, btnId) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if (!input || !btn) return;
        btn.addEventListener('click', () => {
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.classList.toggle('active', isHidden);
        });
    }

    // Token kiolvasása URL-ből
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');

    // Token ellenőrzés indításkor
    async function checkToken() {
        if (!token) {
            showState('state-invalid');
            return;
        }

        try {
            const res = await fetch(`/api/reset-token-check?token=${token}`);
            const data = await res.json();

            if (data.valid) {
                showState('state-form');
                initToggle('new-password', 'toggle-new-password');
                initToggle('confirm-password', 'toggle-confirm-password');
            } else {
                showState('state-invalid');
            }
        } catch (err) {
            showState('state-invalid');
        }
    }

    // Form beküldés
    document.getElementById('reset-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const jelszo = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;
        const msgEl = document.getElementById('reset-msg');
        const submitBtn = document.getElementById('reset-submit-btn');

        if (jelszo.length < 6) {
            msgEl.textContent = 'A jelszónak legalább 6 karakter hosszúnak kell lennie!';
            msgEl.style.color = '#ff6b6b';
            return;
        }

        if (jelszo !== confirm) {
            msgEl.textContent = 'A két jelszó nem egyezik!';
            msgEl.style.color = '#ff6b6b';
            return;
        }

        submitBtn.textContent = 'Mentés...';
        submitBtn.disabled = true;
        msgEl.textContent = '';

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, jelszo })
            });
            const data = await res.json();

            if (data.success) {
                showState('state-success');
            } else {
                msgEl.textContent = data.message || 'Hiba történt, kérj új linket!';
                msgEl.style.color = '#ff6b6b';
                submitBtn.textContent = 'Jelszó mentése';
                submitBtn.disabled = false;
            }
        } catch (err) {
            msgEl.textContent = 'Hálózati hiba, próbáld újra!';
            msgEl.style.color = '#ff6b6b';
            submitBtn.textContent = 'Jelszó mentése';
            submitBtn.disabled = false;
        }
    });

    checkToken();
});
