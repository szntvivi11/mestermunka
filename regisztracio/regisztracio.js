// ==== SHOW MESSAGE ====
function showMessage(msg, type = "success") {
    const container = document.querySelector(".aloldal-container");
    const existing = document.querySelector(".login-message");
    if (existing) existing.remove();
  
    const message = document.createElement("div");
    message.className = `login-message ${type === "error" ? "login-error" : "login-success"}`;
    message.textContent = msg;
    container.prepend(message); // Form fölé
  }
  
  // ==== USER REGISZTRÁCIÓ ====
  const userForm = document.getElementById("student-form");
  userForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const nev = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const jelszo = document.getElementById("reg-password").value.trim();
  
    if (!nev || !email || !jelszo) {
      showMessage("❌ Kérlek, tölts ki minden mezőt!", "error");
      return;
    }
  
    try {
      const res = await fetch("/api/register-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nev, email, jelszo })
      });
  
      const data = await res.json();
      if (data.success) {
        showMessage("✅ Sikeres regisztráció!", "success");
        userForm.reset();
        setTimeout(() => window.location.href = "/bejelentkezes", 1500);
      } else {
        showMessage(data.message || "❌ Hiba a regisztráció során", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Szerverhiba", "error");
    }
  });
  
  // ==== TEACHER REGISZTRÁCIÓ ====
  const teacherForm = document.getElementById("teacher-form");
  teacherForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const felhasznalonev = document.getElementById("teacher-name").value.trim();
    const email = document.getElementById("teacher-email").value.trim();
    const jelszo = document.getElementById("teacher-password").value.trim();
    const vegzettseg = document.getElementById("teacher-course").value.trim();
  
    if (!felhasznalonev || !email || !jelszo || !vegzettseg) {
      showMessage("❌ Kérlek, tölts ki minden mezőt!", "error");
      return;
    }
  
    try {
      const res = await fetch("/api/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ felhasznalonev, email, jelszo, vegzettseg })
      });
  
      const data = await res.json();
      if (data.success) {
        showMessage("✅ Sikeres regisztráció!", "success");
        teacherForm.reset();
        setTimeout(() => window.location.href = "/bejelentkezes", 1500);
      } else {
        showMessage(data.message || "❌ Hiba a regisztráció során", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Szerverhiba", "error");
    }
  });
  