const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

// ===== STATIKUS FÁJLOK =====
app.use(express.static(path.join(__dirname, "public")));
app.use("/bejelentkezes", express.static(path.join(__dirname, "bejelentkezes")));
app.use("/regisztracio", express.static(path.join(__dirname, "regisztracio")));
app.use("/kapcsolat", express.static(path.join(__dirname, "kapcsolat")));
app.use("/tanfolyamok/oldalak", express.static(path.join(__dirname, "Tanfolyamok", "oldalak")));
app.use('/Tanfolyamok/kepek', express.static(path.join(__dirname, 'Tanfolyamok', 'kepek')));
app.use('/tanfolyamok/kepek', express.static(path.join(__dirname, 'Tanfolyamok', 'kepek')));

// ===== HTML OLDALAK =====
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "index.html"))
);

app.get("/bejelentkezes", (req, res) =>
  res.sendFile(path.join(__dirname, "bejelentkezes", "bejelentkezes.html"))
);

app.get("/regisztracio", (req, res) =>
  res.sendFile(path.join(__dirname, "regisztracio", "regisztracio.html"))
);

app.get("/kapcsolat", (req, res) =>
  res.sendFile(path.join(__dirname, "kapcsolat", "kapcsolat.html"))
);

app.get("/tanfolyamok", (req, res) =>
  res.sendFile(path.join(__dirname, "Tanfolyamok", "tanfolyamok.html"))
);

app.get("/profil", (req, res) => {
  res.sendFile(path.join(__dirname, "profil.html"));
});

// Dinamikus tanfolyam oldalak
app.get("/tanfolyamok/:slug", (req, res) => {
  const slug = path.basename(req.params.slug).replace(".html", "");
  const filePath = path.join(__dirname, "Tanfolyamok", "oldalak", `${slug}.html`);

  res.sendFile(filePath, err => {
    if (err) res.status(404).send("Tanfolyam nem található");
  });
});

// ===== ADATBÁZIS =====
const db = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: '',
  database: "mestermunka"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL hiba:", err);
    process.exit(1);
  }
  console.log("✅ MySQL kapcsolat létrejött");
});

// =====================================================
// ================= REGISZTRÁCIÓ =======================
// =====================================================

// ---- diák (user_vevo) ----
app.post("/api/register-user", async (req, res) => {
  const { nev, email, jelszo } = req.body;

  if (!nev || !email || !jelszo)
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    // Ellenőrizzük, hogy létezik-e már az email a user_vevo táblában
    const [exists] = await db.promise().query(
      "SELECT uv_id FROM user_vevo WHERE email = ?",
      [email]
    );

    if (exists.length)
      return res.status(400).json({ success: false, message: "Email már létezik" });

    // Jelszó hash-elése
    const hash = await bcrypt.hash(jelszo, 10);

    // Felhasználó beszúrása a user_vevo táblába
    await db.promise().query(
      `INSERT INTO user_vevo
       (nev, email, felhasznalonev, jelszo, regisztracio_datum)
       VALUES (?, ?, ?, ?, NOW())`,
      [nev, email, nev, hash]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Adatbázis hiba" });
  }
});

// ---- TEACHER (user_ado) ----
app.post("/api/register-teacher", async (req, res) => {
  const { felhasznalonev, email, jelszo, vegzettseg } = req.body;

  if (!felhasznalonev || !email || !jelszo || !vegzettseg)
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    // Ellenőrizzük, hogy létezik-e már az email a user_ado táblában
    const [exists] = await db.promise().query(
      "SELECT ua_id FROM user_ado WHERE gmail = ?",
      [email]
    );

    if (exists.length)
      return res.status(400).json({ success: false, message: "Email már létezik" });

    // Jelszó hash-elése
    const hash = await bcrypt.hash(jelszo, 10);

    // Tanár beszúrása a user_ado táblába
    await db.promise().query(
      `INSERT INTO user_ado
       (felhasznalonev, gmail, jelszo, vegzettseg)
       VALUES (?, ?, ?, ?)`,
      [felhasznalonev, email, hash, vegzettseg]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Adatbázis hiba" });
  }
});


// =====================================================
// ================== BEJELENTKEZÉS =====================
// =====================================================
// Refined login endpoint to ensure proper role validation
app.post("/api/login", async (req, res) => {
  const { email, jelszo, role } = req.body;

  if (!email || !jelszo)
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    if (role === "student") {
      // Check if the user is a student
      const [students] = await db.promise().query(
        "SELECT uv_id, nev, email, jelszo FROM user_vevo WHERE email = ?",
        [email]
      );

      if (students.length) {
        const student = students[0];
        const ok = await bcrypt.compare(jelszo, student.jelszo);
        if (!ok) return res.status(401).json({ success: false, message: "Hibás jelszó" });

        return res.json({
          success: true,
          role: "student",
          user: { id: student.uv_id, nev: student.nev, email: student.email, role: "student" }
        });
      }
    } else if (role === "teacher") {
      // Check if the user is a teacher
      const [teachers] = await db.promise().query(
        "SELECT ua_id, felhasznalonev, gmail, jelszo FROM user_ado WHERE gmail = ?",
        [email]
      );

      if (teachers.length) {
        const teacher = teachers[0];
        const ok = await bcrypt.compare(jelszo, teacher.jelszo);
        if (!ok) return res.status(401).json({ success: false, message: "Hibás jelszó" });

        return res.json({
          success: true,
          role: "teacher",
          user: { id: teacher.ua_id, nev: teacher.felhasznalonev, email: teacher.gmail, role: "teacher" }
        });
      }
    } else if (!role || role === "admin") {
      // Admin login logic with fixed credentials
      const adminUsername = "ADMIN1234";
      const adminPassword = "admin4321";

      if (email === adminUsername && jelszo === adminPassword) {
        return res.json({
          success: true,
          role: "admin",
          user: { 
            id: 0, 
            nev: "Adminisztrátor", 
            email: adminUsername,
            role: "admin" // Ez biztosítja, hogy a frontend lássa a jogosultságot
          }
        });
      } else {
        return res.status(401).json({ success: false, message: "Hibás admin felhasználónév vagy jelszó" });
      }
    }

    return res.status(401).json({ success: false, message: "Nincs ilyen felhasználó vagy helytelen szerepkör" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Szerver hiba" });
  }
});
//multer
// Meghatározzuk, hova kerüljenek a képek és mi legyen a nevük
const storage = multer.diskStorage({
    destination: './Tanfolyamok/kepek/', 
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
const uploadCourseImg = multer({ storage: storage }); 
// Profil adatok lekérdezése adatbázisból
app.get("/api/profile", async (req, res) => {
    try {
        const { id, role } = req.query;
        
        if (!id || !role) {
            return res.status(400).json({ success: false, message: "Hiányzó ID vagy szerepkör" });
        }

        let sql, params;
        
        if (role === 'teacher') {
            sql = "SELECT ua_id as id, felhasznalonev as nev, gmail as email, profilkep, bemutatkozas FROM user_ado WHERE ua_id = ?";
            params = [id];
        } else if (role === 'student') {
            sql = "SELECT uv_id as id, nev, email, profilkep, bemutatkozas FROM user_vevo WHERE uv_id = ?";
            params = [id];
        } else {
            return res.status(400).json({ success: false, message: "Érvénytelen szerepkör" });
        }

        const [rows] = await db.promise().query(sql, params);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Felhasználó nem található" });
        }

        res.json({ success: true, user: rows[0] });
    } catch (err) {
        console.error("❌ Profil lekérdezési hiba:", err);
        res.status(500).json({ success: false, message: "Szerver hiba" });
    }
});

// Profil frissítése (Kép és Bio)
// Használjuk ugyanazt az uploadCourseImg-t, hogy ugyanoda mentse a képet!
app.post("/api/update-profile", upload.single('profilePicture'), async (req, res) => {
    try {
        const { id, role, bemutatkozas } = req.body;
        const profilkep = req.file ? req.file.filename : null;

        // Ellenőrizzük, hogy megérkeztek-e az adatok (debug)
        console.log("Frissítés adatai:", { id, role, bemutatkozas, profilkep });

        if (!id || !role) {
            return res.status(400).json({ error: "Hiányzó ID vagy szerepkör!" });
        }

        const tabla = (role === 'teacher') ? 'user_ado' : 'user_vevo';
        const azonositoOszlop = (role === 'teacher') ? 'ua_id' : 'uv_id';

        let sql = `UPDATE ${tabla} SET bemutatkozas = ?`;
        let params = [bemutatkozas || ''];

        if (profilkep) {
            sql += ", profilkep = ?";
            params.push(profilkep);
        }

        sql += ` WHERE ${azonositoOszlop} = ?`;
        params.push(id);

        console.log("SQL:", sql, "Params:", params);

        // FONTOS: .promise() hozzáadása, ha sima connectiont használsz!
        await db.promise().query(sql, params);

        res.json({ success: true, newPic: profilkep });
    } catch (err) {
        console.error("❌ Profil frissítési hiba:", err); // Ez fog megjelenni a VS Code konzolban!
        res.status(500).json({ error: "Szerver hiba történt a mentéskor." });
    }
});

// ===== TANFOLYAMOK API =====
app.get("/api/kepzesek", async (req, res) => {
  try {
    const [courses] = await db.promise().query("SELECT * FROM kepzesek");
    res.json(courses);
  } catch (err) {
    console.error("❌ Hiba a tanfolyamok lekérdezésekor:", err);
    res.status(500).json({ success: false, message: "Szerver hiba" });
  }
});

// --- KÉPFELTÖLTÉS BEÁLLÍTÁSA ---
// --- MULTER BEÁLLÍTÁS (ha még nincs bent) ---


// --- A JAVÍTOTT POST ÚTVONAL ---
app.post("/api/courses", uploadCourseImg.single('kep'), async (req, res) => {
  try {
    // Az oszlopnevek pontosan a te CREATE TABLE parancsodból:
    const { nev, leiras, helyileg, email, o_nev, heves_kortol, ua_ID, ár } = req.body;
    
   if (!req.file) {
    return res.status(400).json({ success: false, message: "Kép feltöltése kötelező!" });
}

// CSAK a fájl nevét mentjük el, az útvonalat nem!
const kepNev = req.file.filename; 

const sql = `INSERT INTO kepzesek 
             (kep, nev, leiras, helyileg, email, o_nev, heves_kortol, ua_ID, ár) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

await db.promise().query(sql, [
    kepNev, // Itt most már csak pl. "1708612345-kep.jpg" megy be
    nev,
    leiras,
    helyileg,
    email,
    o_nev,
    parseInt(heves_kortol) || 0,
    parseInt(ua_ID),
    parseInt(ár) || 0
])

    res.json({ success: true, message: "Tanfolyam sikeresen mentve!" });
  } catch (err) {
    console.error("❌ MySQL Hiba:", err);
    res.status(500).json({ success: false, message: "Adatbázis hiba: " + err.sqlMessage });
  }
});

// ===== JELENTKEZÉS MENTÉSE =====
app.post("/api/jelentkezes", async (req, res) => {
  const { userId, kepzesId } = req.body;

  if (!userId || !kepzesId)
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    await db.promise().query(
      "INSERT INTO jelentkezesek (user_id, kepzes_id) VALUES (?, ?)",
      [userId, kepzesId]
    );
    res.json({ success: true, message: "Sikeres jelentkezés" });
  } catch (err) {
    console.error(err);

    // ha már jelentkezett
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Már jelentkeztél erre a képzésre" });

    res.status(500).json({ success: false, message: "Szerverhiba" });
  }
});


// ===== KAPCSOLATI ÜZENET MENTÉSE ÉS EMAIL =====
app.post("/api/kapcsolat", async (req, res) => {
    const { nev, email, uzenet } = req.body;
    if (!nev || !email || !uzenet) return res.status(400).json({ success: false, message: "Minden mező kitöltése kötelező!" });

    try {
        await db.promise().query("INSERT INTO uzenetek (nev, email, uzenet) VALUES (?, ?, ?)", [nev, email, uzenet]);
        
        // Ezt csak akkor aktiváld, ha a user/pass adatokat kitöltötted!
        /*
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'SajatEmail@gmail.com', pass: '16jegyukod' }
        });
        await transporter.sendMail({
            from: 'SajatEmail@gmail.com',
            to: 'info@tanfolyamok.hu',
            subject: 'Új üzenet az oldalról',
            text: `${nev} (${email}) küldte: ${uzenet}`
        });
        */
        res.json({ success: true, message: "Üzenet elmentve!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Szerver hiba történt." });
    }
});

// Üzenetek kezelése oldal (admin.html)
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

// Teljes rendszerkezelés oldal (admin-full.html)
// Fontos: a profil oldaladról /admin-full.html-re hivatkozol, így itt is az legyen!
app.get("/admin_full.html", (req, res) => {
    res.sendFile(path.join(__dirname, "admin_full.html"));
});

// ================= ADMIN FUNKCIÓK =================
app.get("/api/admin/uzenetek", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM uzenetek ORDER BY datum DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.delete("/api/admin/uzenetek/:id", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM uzenetek WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.post("/api/admin/valasz", async (req, res) => {
    const { email, uzenet } = req.body;
    console.log(`Válasz küldése ide: ${email} -> ${uzenet}`);
    // Ide jöhet majd a nodemailer sendMail része a válaszhoz
    res.json({ success: true });
});


// --- ADMIN EXTRA API-K ---
// Tanfolyam törlése
app.delete("/api/admin/kepzesek/:id", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM kepzesek WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Összes diák lekérése
app.get("/api/admin/osszes-diak", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT uv_id, nev, email FROM user_vevo");
        res.json(rows);
    } catch (err) { res.status(500).json({ success: false }); }
});

// Összes jelentkezés lekérése (Ki -> Mire)
app.get("/api/admin/osszes-jelentkezes", async (req, res) => {
    try {
        const sql = `
            SELECT v.nev as diak, k.nev as tanfolyam 
            FROM jelentkezesek j
            JOIN user_vevo v ON j.user_id = v.uv_id
            JOIN kepzesek k ON j.kepzes_id = k.id`;
        const [rows] = await db.promise().query(sql);
        res.json(rows);
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get("/api/admin/osszes-tanar", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT ua_id, felhasznalonev, gmail, vegzettseg FROM user_ado");
        res.json(rows);
    } catch (err) { res.status(500).json({ success: false }); }
});


app.post("/api/update-password", async (req, res) => {
    try {
        const { id, role, jelszo } = req.body;
        if (!id || !role || !jelszo) return res.status(400).json({ error: "Hiányzó adatok" });

        const hash = await bcrypt.hash(jelszo, 10);
        const tabla = (role === 'teacher') ? 'user_ado' : 'user_vevo';
        const azonositoOszlop = (role === 'teacher') ? 'ua_id' : 'uv_id';

        const sql = `UPDATE ${tabla} SET jelszo = ? WHERE ${azonositoOszlop} = ?`;
        await db.promise().query(sql, [hash, id]);

        res.json({ success: true, message: "Jelszó sikeresen frissítve!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Szerver hiba a jelszómentéskor" });
    }
});


// ===== 404 =====
app.use((req, res) => {
  res.status(404).send("Az oldal nem található");
});


// ===== SERVER START =====
const PORT = process.env.PORT || 3003;
app.listen(PORT, () =>
  console.log(`🚀 Szerver fut: http://localhost:${PORT}`)
);
