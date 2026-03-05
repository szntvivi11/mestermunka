



window.onload = function() {
    const main = document.getElementById('main-content');
    const pages = {
        bejelentkezes: `
            <h1>Bejelentkezés</h1>
            <form>
                <label>Felhasználónév:</label><br>
                <input type="text"><br>
                <label>Jelszó:</label><br>
                <input type="password"><br><br>
                <button>Bejelentkezés</button>
            </form>
        `,
        
        kapcsolat: `
            <h1>Kapcsolat</h1>
            <form>
                <label>Név:</label><br>
                <input type="text"><br>
                <label>Email:</label><br>
                <input type="email"><br>
                <label>Üzenet:</label><br>
                <textarea></textarea><br><br>
                <button>Küldés</button>
            </form>
        `
    };

    document.querySelectorAll('#navbar a[data-page]').forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            main.innerHTML = pages[page] || `<h1>Üdvözöllek!</h1><p><a href="tanfolyamok.html">Tanfolyamok megtekintése</a></p>`;
        };
    });
};

// User állapot kezelése
        const user = JSON.parse(localStorage.getItem('user')) || null;
        if (!user) {
            const navProfil = document.getElementById('nav-profil');
            if(navProfil) navProfil.style.display = 'none';
        } else {
            const loginNav = document.getElementById('nav-bejelentkezes');
            const registerNav = document.getElementById('nav-regisztracio');
            if (loginNav) loginNav.style.display = 'none';
            if (registerNav) registerNav.style.display = 'none';
        }

        // Form beküldése a szervernek
        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nev = document.getElementById('kapcsolat-nev').value;
            const email = document.getElementById('kapcsolat-email').value;
            const uzenet = document.getElementById('kapcsolat-uzenet').value;
            const responseMsg = document.getElementById('responseMsg');
            const submitBtn = document.getElementById('submitBtn');

            submitBtn.disabled = true;
            submitBtn.textContent = "Küldés...";

            try {
                const res = await fetch('/api/kapcsolat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nev, email, uzenet })
                });

                if (res.ok) {
                    responseMsg.style.color = "#4CAF50";
                    responseMsg.textContent = "Sikeres küldés! Hamarosan válaszolunk.";
                    document.getElementById('contactForm').reset();
                } else {
                    responseMsg.style.color = "#ff4d4d";
                    responseMsg.textContent = "Hiba történt a küldés során.";
                }
            } catch (err) {
                responseMsg.style.color = "#ff4d4d";
                responseMsg.textContent = "Szerverhiba történt.";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Küldés";
            }
        });
