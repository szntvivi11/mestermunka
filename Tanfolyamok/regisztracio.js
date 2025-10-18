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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");

  // Üzenet doboz létrehozása
  const uzenet = document.createElement("div");
  uzenet.style.marginTop = "15px";
  uzenet.style.padding = "10px";
  uzenet.style.borderRadius = "8px";
  uzenet.style.textAlign = "center";
  uzenet.style.display = "none";
  form.appendChild(uzenet);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Mezők beolvasása
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    // Alap: elrejtjük az üzenetet
    uzenet.style.display = "none";

    // Ellenőrzések
    if (!username || !email || !password) {
      showMessage("❌ Kérjük, tölts ki minden mezőt!", "error");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showMessage("❌ Hibás email cím! (hiányzik az '@' vagy a '.' karakter)", "error");
      return;
    }

    // Ha minden rendben van
    showMessage("✅ Adatok elmentve. Üdvözöljük az oldalon!", "success");
    form.reset();

    // 3 másodperc múlva átirányít a bejelentkezés oldalra
    setTimeout(() => {
      window.location.href = "bejelentkezes.html";
    }, 3000);
  });

  // Segédfüggvény az üzenet megjelenítéséhez
  function showMessage(text, type) {
    uzenet.textContent = text;
    uzenet.style.display = "block";
    uzenet.style.transition = "0.3s ease";

    if (type === "success") {
      uzenet.style.backgroundColor = "#d4edda";
      uzenet.style.color = "#155724";
      uzenet.style.border = "1px solid #c3e6cb";
    } else {
      uzenet.style.backgroundColor = "#f8d7da";
      uzenet.style.color = "#721c24";
      uzenet.style.border = "1px solid #f5c6cb";
    }
  }
});


