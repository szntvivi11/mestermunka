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

document.addEventListener('DOMContentLoaded', async () => {
    await updateHeaderProfile();

    const container = document.getElementById('tanfolyamokcards');
    const searchInput = document.getElementById('courseSearch');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    
    let allCourses = [];
    let filteredCourses = [];
    let currentPage = 1;
    const coursesPerPage = 12;

    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    paginationContainer.style.cssText = 'display:flex; justify-content:center; align-items:center; gap:20px; margin: 30px 0; font-size:18px; color: white;';
    container.after(paginationContainer);

    try {
        const res = await fetch('/api/kepzesek');
        if (!res.ok) throw new Error('Hiba a lekéréskor');
        allCourses = await res.json();
        filteredCourses = [...allCourses];
        renderCourses();
    } catch (err) {
        console.error('Hiba a tanfolyamok betöltésekor:', err);
        container.innerHTML = '<p>Nem sikerült betölteni a tanfolyamokat.</p>';
    }

    function renderCourses() {
        container.innerHTML = '';
        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        const currentItems = filteredCourses.slice(startIndex, endIndex);

        if (currentItems.length === 0) {
            container.innerHTML = '<p>Nincs találat.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        currentItems.forEach(course => {
            const card = document.createElement('div');
            card.className = 'tanfolyamkartya';
            card.innerHTML = `
                <img src="/tanfolyamok/kepek/${course.kep}" alt="${course.nev}">
                <h2>${course.nev}</h2>
            `;
            card.addEventListener('click', () => {
                document.getElementById('modalTitle').textContent = course.nev;
                document.getElementById('modalTitle').dataset.courseId = course.id;
                document.getElementById('modalDescription').textContent = course.leiras;
                document.getElementById('modalPrice').textContent = course.ar + " Ft";
                document.getElementById('modalEmail').textContent = course.email;
                document.getElementById('modalAge').textContent = course.heves_kortol + "+ év";
                document.getElementById('modalLocation').textContent = course.helyileg;
                document.getElementById('modalImage').src = `/tanfolyamok/kepek/${course.kep}`;
                modal.style.display = 'flex';
            });
            container.appendChild(card);
        });
        renderPaginationControls();
    }

    function renderPaginationControls() {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.className = 'pagination-btn';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => { currentPage--; renderCourses(); document.getElementById('tanfolyamokmain').scrollIntoView({ behavior: 'smooth' }); };

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `${currentPage} / ${totalPages}`;

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.className = 'pagination-btn';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => { currentPage++; renderCourses(); document.getElementById('tanfolyamokmain').scrollIntoView({ behavior: 'smooth' }); };

        paginationContainer.append(prevBtn, pageInfo, nextBtn);
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredCourses = allCourses.filter(course => course.nev.toLowerCase().includes(searchTerm));
        currentPage = 1;
        renderCourses();
    });

    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('applyButton').addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { alert('Jelentkezéshez be kell jelentkezni!'); return; }
        const courseId = parseInt(document.getElementById('modalTitle').dataset.courseId);
        try {
            const res = await fetch('/api/jelentkezes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, kepzesId: courseId })
            });
            if (res.ok) { alert('Sikeres jelentkezés!'); modal.style.display = 'none'; }
            else { const data = await res.json(); alert(data.message || 'Hiba történt'); }
        } catch (err) { alert('Szerverhiba történt a jelentkezéskor.'); }
    });
});
