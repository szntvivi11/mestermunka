console.log("A profil.js sikeresen betöltődött!");

let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    console.log("Nincs felhasználó a localStorage-ban!");
    alert("Nincs bejelentkezve!");
    location.href = "/bejelentkezes";
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("A DOM betöltődött, gombok inicializálása...");

    // 1. ADATOK BETÖLTÉSE ADATBÁZISBÓL
    try {
        const userId = user.ua_id || user.uv_id || user.id;
        const response = await fetch(`/api/profile?id=${userId}&role=${user.role}`);
        const data = await response.json();
        
        if (data.success) {
            // Frissítjük a localStorage-ban lévő adatokat is, de őrizzük a profilképet
            const currentUserPic = user.profilkep; // Megmentjük a jelenlegi képet
            const updatedUser = { ...user, ...data.user };
            
            // Ha az adatbázisban nincs profilkép, de a localStorage-ban van, megtartjuk
            if (!updatedUser.profilkep && currentUserPic) {
                updatedUser.profilkep = currentUserPic;
            }
            
            localStorage.setItem("user", JSON.stringify(updatedUser));
            user = updatedUser;
            
            // Megjelenítjük az adatokat
            document.getElementById("nev-megjelenit").textContent = user.nev;
            const roleMap = { student: "🎓 Diák", teacher: "📘 Tanár", admin: "👑 Admin" };
            document.getElementById("szerep-megjelenit").textContent = roleMap[user.role] || "Felhasználó";
            document.getElementById("bioDisplay").textContent = user.bemutatkozas || "Nincs bemutatkozás megadva.";
            
            // Profilkép beállítása
            const profileImg = document.getElementById("profileImage");
            if (user.profilkep) {
                const imageUrl = `/Tanfolyamok/kepek/${user.profilkep}?t=${new Date().getTime()}`;
                console.log("Kép URL:", imageUrl);
                
                // Először beállítjuk az src-t
                profileImg.src = imageUrl;
                
                // Debug: ellenőrizzük, hogy létezik-e a kép
                profileImg.onerror = function() {
                    console.error("Hiba a kép betöltésekor:", imageUrl);
                    console.log("Próbálkozás placeholderrel...");
                    this.src = "https://via.placeholder.com/180/242440/3399ff?text=Hiba";
                };
                profileImg.onload = function() {
                    console.log("Kép sikeresen betöltve:", this.src);
                    console.log("Kép méretek:", this.naturalWidth + "x" + this.naturalHeight);
                };
                
                // Kényszerített újratöltés cache-bustinggel
                setTimeout(() => {
                    if (profileImg.complete && profileImg.naturalHeight === 0) {
                        console.log("Kép nem töltődött be, újrapróbálkozás...");
                        profileImg.src = imageUrl + "&retry=1";
                    }
                }, 1000);
            } else {
                profileImg.src = "https://via.placeholder.com/180/242440/3399ff?text=Avatar";
            }
        } else {
            console.error("Profil adatok lekérdezése sikertelen:", data.message);
            // Fallback localStorage adatokkal
            document.getElementById("nev-megjelenit").textContent = user.felhasznalonev || user.nev;
            const roleMap = { student: "🎓 Diák", teacher: "📘 Tanár", admin: "👑 Admin" };
            document.getElementById("szerep-megjelenit").textContent = roleMap[user.role] || "Felhasználó";
            document.getElementById("bioDisplay").textContent = user.bemutatkozas || "Nincs bemutatkozás megadva.";
        }
    } catch (error) {
        console.error("Hiba a profil adatok lekérdezésekor:", error);
        // Fallback localStorage adatokkal
        document.getElementById("nev-megjelenit").textContent = user.felhasznalonev || user.nev;
        const roleMap = { student: "🎓 Diák", teacher: "📘 Tanár", admin: "👑 Admin" };
        document.getElementById("szerep-megjelenit").textContent = roleMap[user.role] || "Felhasználó";
        document.getElementById("bioDisplay").textContent = user.bemutatkozas || "Nincs bemutatkozás megadva.";
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
        btn.textContent = "➕ Tanfolyam hozzáadása";
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
        
        adminBox.innerHTML = `
            <h3 style='color:#7b2ff2; margin-bottom:10px; font-size: 1.1em;'>Adminisztrációs Vezérlő</h3>
            <button class="profil-gomb" id="adminMessagesBtn" style="background:#7b2ff2; margin-bottom: 8px;">📧 Üzenetek Kezelése</button>
            <button class="profil-gomb" id="adminFullBtn" style="background:linear-gradient(45deg, #7b2ff2, #3399ff)">🛠️ Rendszer Kezelése</button>
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

    // 3. MENTÉSI FUNKCIÓ (Bio és Kép frissítése)
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

// --- 4. TANFOLYAM MENTÉSE JAVÍTVA ---
const saveCourseBtn = document.getElementById("saveCourseBtn");
if (saveCourseBtn) {
    saveCourseBtn.onclick = async () => {
        const userId = user.ua_id || user.uv_id || user.id; // Megkeressük a tanár ID-ját
        const formData = new FormData();
        
        // Fontos: Olyan neveket használunk, amiket a server.js vár!
        formData.append("nev", document.getElementById("courseName").value);
        formData.append("leiras", document.getElementById("courseDescription").value);
        formData.append("helyileg", document.getElementById("courseLocation").value);
        formData.append("email", document.getElementById("courseEmail").value);
        formData.append("ár", document.getElementById("coursePrice").value);
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

    // 5. JELSZÓ MENTÉSE
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
});