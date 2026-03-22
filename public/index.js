        async function updateHeaderProfile() {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            
            if (storedUser && storedUser.id) {
                try {
                    const response = await fetch(`/api/profile?id=${storedUser.id}&role=${storedUser.role}`);
                    const data = await response.json();
        
                    if (data.success) {
                        const user = data.user;

                        // Asztali profil
                        const miniProfilLink = document.getElementById('miniProfilLink');
                        const headerImg = document.getElementById('headerProfileImage');
                        // Mobilos profil
                        const miniProfilLinkMobile = document.getElementById('miniProfilLinkMobile');
                        const headerImgMobile = document.getElementById('headerProfileImageMobile');
                        const placeholder = document.getElementById('mobileProfilPlaceholder');

                        const getImgSrc = (profilkep, nev, felhasznalonev) => {
                            if (profilkep) {
                                return profilkep.startsWith('/') ? profilkep : `/Tanfolyamok/kepek/${profilkep}`;
                            }
                            const name = nev || felhasznalonev || 'User';
                            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=50&background=242440&color=3399ff&bold=true&font-size=0.4`;
                        };

                        const imgSrc = getImgSrc(user.profilkep, user.nev, user.felhasznalonev);

                        if (miniProfilLink) miniProfilLink.style.display = 'block';
                        if (headerImg) {
                            headerImg.src = imgSrc;
                            headerImg.onerror = function() {
                                this.src = `https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true&font-size=0.4`;
                            };
                        }

                        if (miniProfilLinkMobile) miniProfilLinkMobile.style.display = 'flex';
                        if (headerImgMobile) {
                            headerImgMobile.src = imgSrc;
                            headerImgMobile.onerror = function() {
                                this.src = `https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true&font-size=0.4`;
                            };
                        }
                        if (placeholder) placeholder.style.display = 'none';
        
                        // Navigációs gombok elrejtése
                        ['nav-bejelentkezes', 'nav-regisztracio'].forEach(id => {
                            const el = document.getElementById(id);
                            if (el) el.style.display = 'none';
                        });
                        ['nav-bejelentkezes-m', 'nav-regisztracio-m'].forEach(id => {
                            const el = document.getElementById(id);
                            if (el) el.style.display = 'none';
                        });

                        const profilNav = document.getElementById('nav-profil');
                        if (profilNav) profilNav.style.display = 'inline-block';
                    }
                } catch (err) {
                    console.error("Hiba a fejléc profil frissítésekor:", err);
                }
            }
        }
        
        document.addEventListener('DOMContentLoaded', updateHeaderProfile);

        // Hamburger menü
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileNavDrawer = document.getElementById('mobileNavDrawer');

        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('open');
            mobileNavDrawer.classList.toggle('open');
        });

        // Kattintásra zárd be a menüt
        mobileNavDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('open');
                mobileNavDrawer.classList.remove('open');
            });
        });
