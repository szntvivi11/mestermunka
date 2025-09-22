
window.onload = function() {
    const main = document.getElementById('main-content');
    const pages = {
        bejelentkezes: `
            <h1>Bejelentkezés</h1>
            <form>
                <label>Felhasználónév:</label><br>
                <input type="text"><br>
                <label>Jelszó:</label><br>
                <input type="password"><br><br>
                <button>Bejelentkezés</button>
            </form>
        `,
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
        kapcsolat: `
            <h1>Kapcsolat</h1>
            <form>
                <label>Név:</label><br>
                <input type="text"><br>
                <label>Email:</label><br>
                <input type="email"><br>
                <label>Üzenet:</label><br>
                <textarea></textarea><br><br>
                <button>Küldés</button>
            </form>
        `
    };

    document.querySelectorAll('#navbar a[data-page]').forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            main.innerHTML = pages[page] || `<h1>Üdvözöllek!</h1><p><a href="tanfolyamok.html">Tanfolyamok megtekintése</a></p>`;
        };
    });
};
