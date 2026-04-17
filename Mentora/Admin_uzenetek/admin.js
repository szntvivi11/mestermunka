        // Admin ellenőrzés
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== "admin") {
            alert("Hozzáférés megtagadva!");
            window.location.href = "/bejelentkezes";
        }

        async function uzenetekBetoltese() {
            const table = document.getElementById('uzenetek-table');
            try {
                const res = await fetch('/api/admin/uzenetek');
                if (!res.ok) throw new Error(`HTTP hiba: ${res.status}`);
                const data = await res.json();

                if (!data || data.length === 0) {
                    table.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#aaa;">Nincsenek üzenetek.</td></tr>';
                    return;
                }

                table.innerHTML = data.map(u => {
                    const datum = new Date(u.datum).toLocaleString('hu-HU');
                    const emailEsc = u.email.replace(/'/g, "\\'");
                    const nevEsc = u.nev.replace(/'/g, "\\'");
                    return `
                        <tr>
                            <td style="font-size:0.8em; color:#b185f5;" data-label="Dátum">${datum}</td>
                            <td data-label="Név"><b>${u.nev}</b></td>
                            <td data-label="Email"><a href="mailto:${u.email}" style="color:#fff;">${u.email}</a></td>
                            <td data-label="Üzenet" style="max-width:300px;">${u.uzenet}</td>
                            <td data-label="Műveletek">
                                <div class="btn-container">
                                    <button class="btn reply-btn" onclick="valaszAblak('${emailEsc}', '${nevEsc}')">Válasz</button>
                                    <button class="btn delete-btn" onclick="torles(${u.id})">Törlés</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

            } catch (err) {
                console.error("Hiba az üzenetek betöltésekor:", err);
                table.innerHTML = `<tr><td colspan="5" class="error-msg">Nem sikerült betölteni az üzeneteket. (${err.message})</td></tr>`;
            }
        }

        function valaszAblak(email, nev) {
            document.getElementById('replyModal').style.display = 'block';
            document.getElementById('modalTitle').textContent = `Válasz: ${nev} (${email})`;
            document.getElementById('replyEmail').value = email;
            document.getElementById('replyNev').value = nev;
            document.getElementById('replyText').value = '';
        }

        async function valaszKuldese() {
            const email = document.getElementById('replyEmail').value;
            const nev = document.getElementById('replyNev').value;
            const uzenet = document.getElementById('replyText').value;
            if (!uzenet.trim()) return alert("Az üzenet nem lehet üres!");

            const kuldesBtn = document.querySelector('#replyModal .reply-btn');
            kuldesBtn.textContent = 'Küldés...';
            kuldesBtn.disabled = true;

            try {
                const res = await fetch('/api/admin/valasz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, nev, uzenet })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    alert(`Válasz sikeresen elküldve ide: ${email}`);
                    document.getElementById('replyModal').style.display = 'none';
                    document.getElementById('replyText').value = '';
                } else {
                    alert("Hiba: " + (data.message || "Ismeretlen hiba"));
                }
            } catch (err) {
                alert("Szerverhiba: " + err.message);
            } finally {
                kuldesBtn.textContent = 'Válasz elküldése';
                kuldesBtn.disabled = false;
            }
        }

        async function torles(id) {
            if (!confirm("Biztosan törlöd ezt az üzenetet?")) return;
            try {
                const res = await fetch(`/api/admin/uzenetek/${id}`, { method: 'DELETE' });
                if (res.ok) uzenetekBetoltese();
                else alert("Törlés sikertelen!");
            } catch (err) {
                alert("Szerverhiba: " + err.message);
            }
        }

        document.getElementById('replyModal').addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });

        uzenetekBetoltese();
