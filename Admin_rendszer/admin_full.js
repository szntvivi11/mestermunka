    // Jogosultság ellenőrzés
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== 'admin') {
        alert("Nincs jogosultságod!");
        location.href = "/bejelentkezes";
    }

    async function safeFetch(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);
        return res.json();
    }

    async function loadData() {
        // 1. Tanfolyamok betöltése
        try {
            const kepzesek = await safeFetch('/api/kepzesek');
            document.getElementById('tanfolyam-lista').innerHTML = kepzesek.length
                ? kepzesek.map(k => `
                    <tr>
                        <td>${k.id}</td>
                        <td><b>${k.nev}</b></td>
                        <td>${k.email}</td>
                        <td>${k.ar} Ft</td>
                        <td><button class="btn btn-danger" onclick="deleteCourse(${k.id})">Törlés</button></td>
                    </tr>`).join('')
                : '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px;">Nincs tanfolyam.</td></tr>';
        } catch (err) {
            document.getElementById('tanfolyam-lista').innerHTML = `<tr><td colspan="5" class="error-msg">${err.message}</td></tr>`;
        }

        // 2. Tanárok betöltése
        try {
            const tanarok = await safeFetch('/api/admin/osszes-tanar');
            document.getElementById('tanar-lista').innerHTML = tanarok.length
                ? tanarok.map(t => `
                    <tr>
                        <td>${t.ua_id}</td>
                        <td><span class="badge badge-teacher">${t.felhasznalonev}</span></td>
                        <td>${t.gmail}</td>
                        <td>${t.vegzettseg || 'Nincs megadva'}</td>
                    </tr>`).join('')
                : '<tr><td colspan="4" style="text-align:center;color:#aaa;padding:20px;">Nincs tanár.</td></tr>';
        } catch (err) {
            document.getElementById('tanar-lista').innerHTML = `<tr><td colspan="4" class="error-msg">${err.message}</td></tr>`;
        }

        // 3. Diákok betöltése
        try {
            const diakok = await safeFetch('/api/admin/osszes-diak');
            document.getElementById('diak-lista').innerHTML = diakok.length
                ? diakok.map(d => `
                    <tr>
                        <td>${d.uv_id}</td>
                        <td>${d.nev}</td>
                        <td>${d.email}</td>
                    </tr>`).join('')
                : '<tr><td colspan="3" style="text-align:center;color:#aaa;padding:20px;">Nincs diák.</td></tr>';
        } catch (err) {
            document.getElementById('diak-lista').innerHTML = `<tr><td colspan="3" class="error-msg">${err.message}</td></tr>`;
        }

        // 4. Jelentkezések betöltése
        try {
            const jelentkezesek = await safeFetch('/api/admin/osszes-jelentkezes');
            document.getElementById('jelentkezes-lista').innerHTML = jelentkezesek.length
                ? jelentkezesek.map(j => `
                    <tr>
                        <td><span class="badge badge-student">${j.diak}</span></td>
                        <td><span class="badge badge-course">${j.tanfolyam}</span></td>
                    </tr>`).join('')
                : '<tr><td colspan="2" style="text-align:center;color:#aaa;padding:20px;">Nincs jelentkezés.</td></tr>';
        } catch (err) {
            document.getElementById('jelentkezes-lista').innerHTML = `<tr><td colspan="2" class="error-msg">${err.message}</td></tr>`;
        }
    }

    // Tanfolyam törlése
    async function deleteCourse(id) {
        if (!confirm("Biztosan törölni akarod ezt a tanfolyamot?")) return;
        try {
            const res = await fetch(`/api/admin/kepzesek/${id}`, { method: 'DELETE' });
            if (res.ok) loadData();
            else alert("Hiba történt a törlés során!");
        } catch (err) {
            alert("Szerverhiba: " + err.message);
        }
    }

    // Indítás
    loadData();
