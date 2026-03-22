console.log("A profil.js sikeresen betöltődött!");

let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    console.log("Nincs felhasználó a localStorage-ban!");
    alert("Nincs bejelentkezve!");
    location.href = "/bejelentkezes";
}

async function updateHeaderProfile() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) return;

    try {
        const response = await fetch(`/api/profile?id=${storedUser.id}&role=${storedUser.role}`);
        const data = await response.json();

        if (data.success) {
            const u = data.user;

            const getImgSrc = (profilkep, nev, felhasznalonev) => {
                if (profilkep) return profilkep.startsWith('/') ? profilkep : `/Tanfolyamok/kepek/${profilkep}`;
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(nev || felhasznalonev || 'User')}&size=50&background=242440&color=3399ff&bold=true&font-size=0.4`;
            };

            const imgSrc = getImgSrc(u.profilkep, u.nev, u.felhasznalonev);

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
            if (miniProfilLinkMobile) miniProfilLinkMobile.style.display = 'flex';
            if (headerImgMobile) {
                headerImgMobile.src = imgSrc;
                headerImgMobile.onerror = function() {
                    this.src = `https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true`;
                };
            }

            ['nav-bejelentkezes', 'nav-regisztracio', 'nav-bejelentkezes-m', 'nav-regisztracio-m'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }
    } catch (err) {
        console.error("Hiba a header profil frissítésekor:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    await updateHeaderProfile();

    console.log("DOM betöltődött");

    const profileImg = document.getElementById("profileImage");

    function setProfileImage(pic) {

        if (!pic) {
            // Alapértelmezett avatar: egyedileg generált avatar minden felhasználónak
            const userId = user.ua_id || user.uv_id || user.id || 'default';
            const userName = user.nev || user.felhasznalonev || 'User';
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=180&background=242440&color=3399ff&bold=true&font-size=0.4`;
            return;
        }

        const veglegesUtvonal = pic.startsWith("/Tanfolyamok/kepek/")
            ? pic
            : `/Tanfolyamok/kepek/${pic}`;

        const url = `${veglegesUtvonal}?t=${new Date().getTime()}`;

        profileImg.src = url;

        profileImg.onerror = () => {
            console.error("Kép betöltési hiba:", url);
            // Ha a kép betöltése sikertelen, visszaállítjuk az alapértelmezett avatarra
            const userName = user.nev || user.felhasznalonev || 'User';
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=180&background=242440&color=3399ff&bold=true&font-size=0.4`;
        };

        profileImg.onload = () => {
            console.log("Kép betöltve:", profileImg.src);
        };

    }

    function renderProfileFromLocal() {
        document.getElementById("nev-megjelenit").textContent =
            user.nev || user.felhasznalonev || "Felhasználó";

        const roleMap = {
            student: "Diák",
            teacher: "Tanár",
            admin: "Admin"
        };

        document.getElementById("szerep-megjelenit").textContent =
            roleMap[user.role] || "Felhasználó";

        document.getElementById("bioDisplay").textContent =
            user.bemutatkozas || "Nincs bemutatkozás megadva.";

        setProfileImage(user.profilkep);
    }

    renderProfileFromLocal();

    try {

        const userId = user.ua_id || user.uv_id || user.id;

        const response = await fetch(`/api/profile?id=${userId}&role=${user.role}`);
        const data = await response.json();

        if (data.success) {
            const updatedUser = {
                ...data.user,
                ...user,
                role: user.role || data.user.role,
                id: user.id || data.user.id
            };

            if (!updatedUser.nev && data.user.nev) updatedUser.nev = data.user.nev;
            if (!updatedUser.profilkep && data.user.profilkep) updatedUser.profilkep = data.user.profilkep;
            if (!updatedUser.bemutatkozas && data.user.bemutatkozas) updatedUser.bemutatkozas = data.user.bemutatkozas;

            localStorage.setItem("user", JSON.stringify(updatedUser));
            user = updatedUser;
            renderProfileFromLocal();
        } else {
            renderProfileFromLocal();
        }

    } catch (error) {

        console.error("Profil betöltési hiba:", error);

        renderProfileFromLocal();

    }
    // 2. MODÁL NYITÁS LOGIKA
    document.getElementById("editBioBtn").onclick = () => {
        document.getElementById("bio-input").value = user.bemutatkozas || "";
        document.getElementById("bioModal").style.display = "flex";
    };

    document.getElementById("uploadPicBtn").onclick = () => {
        document.getElementById("uploadModal").style.display = "flex";
    };

    document.getElementById("changePasswordBtn").onclick = () => {
        document.getElementById("passwordModal").style.display = "flex";
    };

    // --- DINAMIKUS GOMBOK ---
    const card = document.querySelector(".profil-card");
    const logoutBtn = document.getElementById("logout");

    // HA TANÁR: Tanfolyam hozzáadása gomb
    if (user.role === "teacher") {
        const btn = document.createElement("button");
        btn.className = "profil-gomb";
        btn.textContent = "Tanfolyam hozzáadása";
        btn.onclick = () => document.getElementById("addCourseModal").style.display = "flex";
        card.insertBefore(btn, logoutBtn);
    }

    // HA ADMIN: Adminisztrációs vezérlő panel
    if (user.role === "admin") {
        const adminBox = document.createElement("div");
        adminBox.style.marginTop = "20px";
        adminBox.style.padding = "15px";
        adminBox.style.border = "2px dashed #7b2ff2";
        adminBox.style.borderRadius = "15px";
        adminBox.style.marginBottom = "10px";
        adminBox.style.width = "100%";
        adminBox.style.maxWidth = "380px";
        adminBox.style.display = "flex";
        adminBox.style.flexDirection = "column";
        adminBox.style.alignItems = "center";
        adminBox.style.textAlign = "center";
        
        adminBox.innerHTML = `
            <h3 style='color:#7b2ff2; margin-bottom:10px; font-size: 1.1em;'>Adminisztrációs Vezérlő</h3>
            <button class="profil-gomb" id="adminMessagesBtn" style="background:#7b2ff2; margin-bottom: 8px;">Üzenetek Kezelése</button>
            <button class="profil-gomb" id="adminFullBtn" style="background:linear-gradient(45deg, #7b2ff2, #3399ff)">Rendszer Kezelése</button>
        `;
        card.insertBefore(adminBox, logoutBtn);

        document.getElementById("adminMessagesBtn").onclick = () => { location.href = "/admin"; };
        document.getElementById("adminFullBtn").onclick = () => { location.href = "/admin_full.html"; };
    }

    // Modálok lezárása (Mégse gombok)
    document.querySelectorAll(".closeModal").forEach(btn => {
        btn.onclick = () => {
            btn.closest('.modal').style.display = "none";
        };
    });

    // 3. MENTÉSI FUNKCIÓ (Bemutatkozás és kép frissítése)
    const handleProfileUpdate = async (fileInput = null) => {
        const userId = user.ua_id || user.uv_id || user.id; 
        const bioText = document.getElementById("bio-input").value;

        const formData = new FormData();
        formData.append("id", userId);
        formData.append("role", user.role); 
        formData.append("bemutatkozas", bioText);

        if (fileInput && fileInput.files[0]) {
            formData.append("profilePicture", fileInput.files[0]);
        }

        try {
            const res = await fetch("/api/update-profile", { 
                method: "POST", 
                body: formData 
            });
            const data = await res.json();
            
            if (data.success) {
                if (data.newPic) {
                    user.profilkep = data.newPic;
                    const profileImg = document.getElementById("profileImage");
                    profileImg.src = `/Tanfolyamok/kepek/${data.newPic}?t=${new Date().getTime()}`;
                }
                user.bemutatkozas = bioText;
                localStorage.setItem("user", JSON.stringify(user));
                document.getElementById("bioDisplay").textContent = bioText;

                alert("Sikeres mentés!");
                document.getElementById("uploadModal").style.display = "none";
                document.getElementById("bioModal").style.display = "none";
            } else {
                alert("Hiba: " + (data.error || "Ismeretlen hiba"));
            }
        } catch (e) {
            console.error("Fetch hiba:", e);
            alert("Szerver hiba történt!");
        }
    };

    document.getElementById("saveBioBtn").onclick = () => handleProfileUpdate();
    document.getElementById("savePicBtn").onclick = () => {
        const fileInput = document.getElementById("profileFile");
        if (!fileInput.files[0]) return alert("Válassz ki egy képet!");
        handleProfileUpdate(fileInput);
    };

// --- 4. TANFOLYAM MENTÉS JAVÍTVA ---
const saveCourseBtn = document.getElementById("saveCourseBtn");
if (saveCourseBtn) {
    saveCourseBtn.onclick = async () => {
        const userId = user.ua_id || user.uv_id || user.id; // Megkeressük a tanár ID-ját
        const formData = new FormData();
        
        // Fontos: Olyan neveket használunk, amiket a szerver vár!
        formData.append("nev", document.getElementById("courseName").value);
        formData.append("leiras", document.getElementById("courseDescription").value);
        formData.append("helyileg", document.getElementById("courseLocation").value);
        formData.append("email", document.getElementById("courseEmail").value);
        formData.append("ar", document.getElementById("coursePrice").value);
        formData.append("o_nev", document.getElementById("courseOwner").value);
        formData.append("heves_kortol", document.getElementById("courseAgeLimit").value);
        formData.append("ua_ID", userId); // Ez kell a szervernek!

        const fileInput = document.getElementById("courseImageFile");
        if (fileInput.files[0]) {
            formData.append("kep", fileInput.files[0]); // A szerver 'kep' néven várja a fájlt!
        } else {
            return alert("Kép feltöltése kötelező!");
        }

        try {
            // A szervereden az útvonal: /api/courses
            const res = await fetch("/api/courses", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                alert("Tanfolyam sikeresen hozzáadva!");
                location.reload(); // Frissítjük az oldalt
            } else {
                alert("Hiba: " + data.message);
            }
        } catch (e) {
            console.error("Hiba:", e);
            alert("Szerver hiba történt a mentés során.");
        }
    };
}

    // 5. JELSZÓ MENTÉS
    const savePasswordBtn = document.getElementById("savePasswordBtn");
    if (savePasswordBtn) {
        savePasswordBtn.onclick = async () => {
            const newPass = document.getElementById("newPassword").value;
            const userId = user.ua_id || user.uv_id || user.id;

            if (newPass.length < 4) return alert("A jelszó túl rövid!");

            try {
                const res = await fetch("/api/update-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: userId, role: user.role, jelszo: newPass })
                });
                if (res.ok) {
                    alert("Jelszó módosítva!");
                    document.getElementById("passwordModal").style.display = "none";
                } else {
                    alert("Hiba történt a jelszó módosítása közben.");
                }
            } catch (e) {
                alert("Hiba a mentés során!");
            }
        };
    }

    // 6. KIJELENTKEZÉS
    document.getElementById("logout").onclick = () => {
        localStorage.removeItem("user");
        location.href = "/";
    };

    // 7. DIÁK JELENTKEZÉSEINEK BETÖLTÉSE
    if (user.role === "student") {
        const userId = user.uv_id || user.id;
        const studentSection = document.getElementById("studentApplicationsSection");
        const applicationsContainer = document.getElementById("applicationsContainer");
        
        try {
            const response = await fetch(`/api/diak/jelentkezesek/${userId}`);
            const data = await response.json();
            
            if (data.success && data.jelentkezesek.length > 0) {
                studentSection.style.display = "block";
                
                data.jelentkezesek.forEach(jelentkezes => {
                    const card = document.createElement("div");
                    card.className = "application-card";
                    
                    const kep = jelentkezes.kep ? `/Tanfolyamok/kepek/${jelentkezes.kep}` : "https://via.placeholder.com/80/242440/3399ff?text=Kép";
                    const datum = new Date(jelentkezes.jelentkezes_datum).toLocaleDateString('hu-HU');
                    
                    card.innerHTML = `
                        <img src="${kep}" alt="${jelentkezes.tanfolyam_nev}" onerror="this.src='https://via.placeholder.com/80/242440/3399ff?text=Kép'">
                        <div class="application-info">
                            <h4>${jelentkezes.tanfolyam_nev}</h4>
                            <p> Oktató: ${jelentkezes.oktato_nev || "Nincs megadva"}</p>
                            <p> Email: ${jelentkezes.oktato_email}</p>
                            <p class="application-date"> Jelentkezés: ${datum}</p>
                        </div>
                    `;
                    
                    applicationsContainer.appendChild(card);
                });
            } else if (data.success) {
                studentSection.style.display = "block";
                applicationsContainer.innerHTML = '<div class="no-data">Még nem jelentkeztél egy tanfolyamra sem.</div>';
            }
        } catch (error) {
            console.error("Hiba a jelentkezések betöltésekor:", error);
        }
    }

    // 8. TANÁR TANFOLYAMAINAK ÉS JELENTKEZŐINEK BETÖLTÉSE
    if (user.role === "teacher") {
        const teacherId = user.ua_id || user.id;
        const teacherSection = document.getElementById("teacherCoursesSection");
        const coursesContainer = document.getElementById("teacherCoursesContainer");
        
        try {
            const response = await fetch(`/api/tanar/tanfolyamok/${teacherId}`);
            const data = await response.json();
            
            if (data.success && data.tanfolyamok.length > 0) {
                teacherSection.style.display = "block";
                
                data.tanfolyamok.forEach(tanfolyam => {
                    const card = document.createElement("div");
                    card.className = "teacher-course-card";
                    
                    const kep = tanfolyam.kep ? `/Tanfolyamok/kepek/${tanfolyam.kep}` : "https://via.placeholder.com/100/242440/7b2ff2?text=Kép";
                    
                    let applicantsHTML = '<div class="applicants-section"><h5> Jelentkezők:</h5>';
                    
                    if (tanfolyam.jelentkezok && tanfolyam.jelentkezok.length > 0) {
                        tanfolyam.jelentkezok.forEach(jelentkezo => {
                            const datum = new Date(jelentkezo.jelentkezes_datum).toLocaleDateString('hu-HU');
                            applicantsHTML += `
                                <div class="applicant-item">
                                    <p><span class="applicant-name"> ${jelentkezo.nev}</span></p>
                                    <p> ${jelentkezo.email}</p>
                                    <p style="font-size: 0.85em; opacity: 0.7;"> Jelentkezett: ${datum}</p>
                                </div>
                            `;
                        });
                    } else {
                        applicantsHTML += '<p class="no-applicants">Még nincs jelentkező erre a tanfolyamra.</p>';
                    }
                    applicantsHTML += '</div>';
                    
                    card.innerHTML = `
                        <div class="course-header">
                            <img src="${kep}" alt="${tanfolyam.nev}" onerror="this.src='https://via.placeholder.com/100/242440/7b2ff2?text=Kép'">
                            <div class="course-header-info">
                                <h4>${tanfolyam.nev}</h4>
                                <p> ${tanfolyam.helyileg}</p>
                                <p> ${tanfolyam.ar.toLocaleString('hu-HU')} Ft</p>
                                <p> Korhatár: ${tanfolyam.heves_kortol}+</p>
                            </div>
                        </div>
                        ${applicantsHTML}
                    `;
                    
                    coursesContainer.appendChild(card);
                });
            } else if (data.success) {
                teacherSection.style.display = "block";
                coursesContainer.innerHTML = '<div class="no-data">Még nem hirdettél meg tanfolyamot. Kattints a "Tanfolyam hozzáadása" gombra!</div>';
            }
        } catch (error) {
            console.error("Hiba a tanfolyamok betöltésekor:", error);
        }
    }
});
