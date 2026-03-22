function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (err) {
    return null;
  }
}

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

function setAuthNavVisible(visible) {
  const loginNav = document.getElementById('nav-bejelentkezes');
  const registerNav = document.getElementById('nav-regisztracio');
  const loginNavMobile = document.getElementById('nav-bejelentkezes-m');
  const registerNavMobile = document.getElementById('nav-regisztracio-m');

  const value = visible ? '' : 'none';
  if (loginNav) loginNav.style.display = value;
  if (registerNav) registerNav.style.display = value;
  if (loginNavMobile) loginNavMobile.style.display = value;
  if (registerNavMobile) registerNavMobile.style.display = value;
}

async function updateHeaderProfile() {
  const storedUser = getStoredUser();
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

    // Csak valid szerver válasz után rejtjük az auth linkeket.
    setAuthNavVisible(false);
  } catch (err) {
    console.error(err);
  }
}

function showMessage(msg, type = 'success') {
  const container = document.querySelector('.aloldal-container');
  if (!container) return;

  const existing = document.querySelector('.login-message');
  if (existing) existing.remove();

  const message = document.createElement('div');
  message.className = `login-message ${type === 'error' ? 'login-error' : 'login-success'}`;
  message.textContent = msg;
  container.prepend(message);
}

function initRoleSelection() {
  const roleRadios = document.querySelectorAll('input[name="role"]');
  const teacherFields = document.querySelector('.teacher-fields');
  if (!roleRadios.length || !teacherFields) return;

  const syncTeacherSection = () => {
    const selected = document.querySelector('input[name="role"]:checked');
    teacherFields.style.display = selected && selected.value === 'teacher' ? 'block' : 'none';
  };

  roleRadios.forEach(radio => {
    radio.addEventListener('change', syncTeacherSection);
  });

  syncTeacherSection();
}

function initPasswordToggle() {
  const passwordInput = document.getElementById('reg-password');
  const toggleBtn = document.getElementById('toggle-reg-password');
  if (!passwordInput || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.setAttribute('aria-label', isHidden ? 'Jelszó elrejtése' : 'Jelszó megjelenítése');
    toggleBtn.setAttribute('title', isHidden ? 'Jelszó elrejtése' : 'Jelszó megjelenítése');
    toggleBtn.classList.toggle('active', isHidden);
  });
}

function initRegistrationForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const role = document.querySelector('input[name="role"]:checked')?.value;
    const teacherFields = document.querySelector('.teacher-fields');
    const nev = document.getElementById('reg-username')?.value.trim() || '';
    const email = document.getElementById('reg-email')?.value.trim() || '';
    const jelszo = document.getElementById('reg-password')?.value.trim() || '';
    const vegzettseg = document.getElementById('teacher-course')?.value.trim() || '';

    if (!nev || !email || !jelszo) {
      showMessage('Kérlek, tölts ki minden kötelező mezőt!', 'error');
      return;
    }

    if (role === 'teacher' && !vegzettseg) {
      showMessage('Kérlek, add meg a végzettséged!', 'error');
      return;
    }

    try {
      const res = await fetch(role === 'user' ? '/api/register-user' : '/api/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nev,
          felhasznalonev: nev,
          email,
          jelszo,
          vegzettseg
        })
      });

      const data = await res.json();
      if (data.success) {
        showMessage('Sikeres regisztráció!', 'success');
        form.reset();
        if (teacherFields) teacherFields.style.display = 'none';
        setTimeout(() => {
          window.location.href = '/bejelentkezes';
        }, 1500);
      } else {
        showMessage(data.message || 'Hiba a regisztráció során', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Szerverhiba', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPasswordToggle();
  initRoleSelection();
  initRegistrationForm();
  setAuthNavVisible(true);
  updateHeaderProfile();
});
