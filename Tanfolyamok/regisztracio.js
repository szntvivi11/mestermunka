window.oldal = function(){
    const main = document.getElementById('main-content');
    const page = {
        regisztracio: `
            <h1>Regisztráció</h1>
            <form>
                <label>Felhasználónév:</label><br>
                <input type="text"><br>
                <label>Email:</label><br>
                <input type="email"><br>
                <label>Jelszó:</label><br>
                <input type="password"><br><br>
                <button>Regisztráció</button>
            </form>
       `,
    };
};

// === FÜLVÁLTÁS KEZELÉSE ===
const userTab = document.getElementById("user-tab");
const teacherTab = document.getElementById("teacher-tab");
const userForm = document.getElementById("user-form");
const teacherForm = document.getElementById("teacher-form");

// Fülváltás esemény
userTab.addEventListener("click", () => {
  userTab.classList.add("active");
  teacherTab.classList.remove("active");
  userForm.classList.add("active");
  teacherForm.classList.remove("active");
});

teacherTab.addEventListener("click", () => {
  teacherTab.classList.add("active");
  userTab.classList.remove("active");
  teacherForm.classList.add("active");
  userForm.classList.remove("active");
});


// === FELHASZNÁLÓI REGISZTRÁCIÓ ===
// === FELHASZNÁLÓI REGISZTRÁCIÓ ===
userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  // Előző üzenet törlése
  const existing = document.querySelector('.login-message');
  if (existing) existing.remove();

  // Ellenőrzések
  if (!username || !email || !password) {
    showMessage("❌ Kérlek, tölts ki minden mezőt!", "error");
    return;
  }

  if (!email.includes("@")) {
    showMessage("⚠️ Hibás e-mail cím! (hiányzik a @ karakter)", "error");
    return;
  }

  showMessage(`✅ Sikeres regisztráció, ${username}!`, "success");

  userForm.reset();

  // 2 másodperc múlva átirányítás a bejelentkezésre
  setTimeout(() => {
    window.location.href = "bejelentkezes.html";
  }, 2000);
});

// === Üzenet megjelenítése ===
function showMessage(text, type) {
  const container = document.querySelector(".user-form-container") || document.querySelector(".aloldal-container");
  const message = document.createElement("div");
  message.className = `login-message ${type === "error" ? "login-error" : "login-success"}`;
  message.textContent = text;
  container.appendChild(message);
}
// === TANFOLYAMADÓ REGISZTRÁCIÓ ===
teacherForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("teacher-name").value.trim();
  const email = document.getElementById("teacher-email").value.trim();
  const password = document.getElementById("teacher-password").value.trim();
  const course = document.getElementById("teacher-course").value.trim();
  const desc = document.getElementById("teacher-desc").value.trim();

  // Előző üzenet törlése
  const existing = document.querySelector('.login-message');
  if (existing) existing.remove();

  // Ellenőrzések
  if (!name || !email || !password || !course || !desc) {
    showMessage("❌ Kérlek, tölts ki minden mezőt!", "error");
    return;
  }

  if (!email.includes("@")) {
    showMessage("⚠️ Hibás e-mail cím! (hiányzik a @ karakter)", "error");
    return;
  }

  showMessage(`✅ Sikeres regisztráció, ${name}!`, "success");

  teacherForm.reset();

  // 2 másodperc múlva átirányítás a bejelentkezésre
  setTimeout(() => {
    window.location.href = "bejelentkezes.html";
  }, 2000);
});




