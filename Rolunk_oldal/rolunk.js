    // Hamburger menü
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
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

    async function updateHeaderProfile() {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.id) {
            try {
                const response = await fetch(`/api/profile?id=${storedUser.id}&role=${storedUser.role}`);
                const data = await response.json();
                if (data.success) {
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
                        headerImg.onerror = function() {
                            this.src = `https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true`;
                        };
                    }

                    const miniProfilLinkMobile = document.getElementById('miniProfilLinkMobile');
                    const headerImgMobile = document.getElementById('headerProfileImageMobile');
                    const placeholder = document.getElementById('mobileProfilPlaceholder');
                    if (miniProfilLinkMobile) miniProfilLinkMobile.style.display = 'flex';
                    if (headerImgMobile) {
                        headerImgMobile.src = imgSrc;
                        headerImgMobile.onerror = function() {
                            this.src = `https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true`;
                        };
                    }
                    if (placeholder) placeholder.style.display = 'none';

                    ['nav-bejelentkezes','nav-regisztracio','nav-bejelentkezes-m','nav-regisztracio-m'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.display = 'none';
                    });
                }
            } catch (err) { console.error(err); }
        }
    }
    document.addEventListener('DOMContentLoaded', updateHeaderProfile);
