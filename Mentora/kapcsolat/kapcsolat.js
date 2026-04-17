function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
    if (!hamburgerBtn || !mobileNavDrawer) return;

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('open');
        mobileNavDrawer.classList.toggle('open');
    });

    mobileNavDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('open');
            mobileNavDrawer.classList.remove('open');
        });
    });
}

async function updateHeaderProfile() {
    let storedUser = null;
    try {
        storedUser = JSON.parse(localStorage.getItem('user'));
    } catch (err) {
        storedUser = null;
    }

    if (!storedUser || !storedUser.id) return;

    try {
        const response = await fetch(`/api/profile?id=${storedUser.id}&role=${storedUser.role}`);
        const data = await response.json();
        if (!data.success) return;

        const user = data.user;
        const getImgSrc = (profilkep, nev, felhasznalonev) => {
            if (profilkep) return profilkep.startsWith('/') ? profilkep : `/Tanfolyamok/kepek/${profilkep}`;
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(nev || felhasznalonev || 'User')}&size=50&background=242440&color=3399ff&bold=true&font-size=0.4`;
        };
        const imgSrc = getImgSrc(user.profilkep, user.nev, user.felhasznalonev);

        const miniProfilLink = document.getElementById('miniProfilLink');
        const headerImg = document.getElementById('headerProfileImage');
        if (miniProfilLink) miniProfilLink.style.display = 'block';
        if (headerImg) {
            headerImg.src = imgSrc;
            headerImg.onerror = function () {
                this.src = 'https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true';
            };
        }

        const miniProfilLinkMobile = document.getElementById('miniProfilLinkMobile');
        const headerImgMobile = document.getElementById('headerProfileImageMobile');
        const placeholder = document.getElementById('mobileProfilPlaceholder');
        if (miniProfilLinkMobile) miniProfilLinkMobile.style.display = 'flex';
        if (headerImgMobile) {
            headerImgMobile.src = imgSrc;
            headerImgMobile.onerror = function () {
                this.src = 'https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true';
            };
        }
        if (placeholder) placeholder.style.display = 'none';

        ['nav-bejelentkezes', 'nav-regisztracio', 'nav-bejelentkezes-m', 'nav-regisztracio-m'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    } catch (err) {
        console.error(err);
    }
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const nev = document.getElementById('kapcsolat-nev')?.value || '';
        const email = document.getElementById('kapcsolat-email')?.value || '';
        const uzenet = document.getElementById('kapcsolat-uzenet')?.value || '';
        const responseMsg = document.getElementById('responseMsg');
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn || !responseMsg) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Küldés...';

        try {
            const res = await fetch('/api/kapcsolat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nev, email, uzenet })
            });

            if (res.ok) {
                responseMsg.style.color = '#4CAF50';
                responseMsg.textContent = 'Sikeres küldés! Hamarosan válaszolunk.';
                form.reset();
            } else {
                responseMsg.style.color = '#ff4d4d';
                responseMsg.textContent = 'Hiba történt a küldés során.';
            }
        } catch (err) {
            responseMsg.style.color = '#ff4d4d';
            responseMsg.textContent = 'Szerverhiba történt.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Üzenet küldése';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    updateHeaderProfile();
    initContactForm();
});
