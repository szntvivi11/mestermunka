const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();


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
app.use (express.static(path.join(__dirname, 'rolunk')));

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

app.get("/rolunk", (req, res) => {
  res.sendFile(path.join(__dirname, "rolunk.html"));
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
  port: 3306,
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

const MAIL_USER = process.env.MAIL_USER;
const MAIL_APP_PASS = (process.env.MAIL_APP_PASS || "").replace(/\s+/g, "").trim();
const MAIL_TO = process.env.MAIL_TO || MAIL_USER;

if (MAIL_USER && MAIL_APP_PASS && MAIL_APP_PASS.length !== 16) {
  console.warn(`⚠️ MAIL_APP_PASS hossza hibás (${MAIL_APP_PASS.length}). Gmail app jelszó pontosan 16 karakter.`);
}

function createMailTransporter() {
  if (!MAIL_USER || !MAIL_APP_PASS) return null;
  if (MAIL_APP_PASS.length !== 16) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: MAIL_USER,
      pass: MAIL_APP_PASS,
    },
  });
}

async function sendMailSafe({ to, subject, text, html, replyTo }) {
  const transporter = createMailTransporter();

  if (!transporter) {
    console.warn("⚠️ Email küldés kihagyva: MAIL_USER vagy MAIL_APP_PASS nincs beállítva.");
    return { sent: false, skipped: true };
  }

  try {
    await transporter.sendMail({
      from: `Tanfolyamok <${MAIL_USER}>`,
      to,
      subject,
      text,
      html,
      replyTo,
    });
    console.log(`✅ Email sikeresen elküldve: ${to}`);
    return { sent: true, skipped: false };
  } catch (error) {
    console.error(`❌ Email küldési hiba (${to}):`, error.message);
    return { sent: false, skipped: false, error: error.message };
  }
}


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

    // Email küldés - ne befolyásolja a sikeres választ ha hibázik
    let emailSent = false;
    try {
      const emailResult = await sendMailSafe({
        to: email,
        subject: "Sikeres regisztráció",
        text: `Szia ${nev}!\n\nSikeresen regisztráltál a Tanfolyamok oldalra.\n\nÜdv,\nTanfolyamok csapata`,
        html: `<p>Szia <strong>${nev}</strong>!</p><p>Sikeresen regisztráltál a Tanfolyamok oldalra.</p><p>Üdv,<br>Tanfolyamok csapata</p>`,
      });
      emailSent = emailResult.sent;
    } catch (mailErr) {
      console.error("Email küldési hiba (nem blokkolja a regisztrációt):", mailErr);
    }

    res.json({ success: true, emailSent });
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

    // Email küldés - ne befolyásolja a sikeres választ ha hibázik
    let emailSent = false;
    try {
      const emailResult = await sendMailSafe({
        to: email,
        subject: "Sikeres tanári regisztráció",
        text: `Szia ${felhasznalonev}!\n\nSikeresen regisztráltál tanárként a Tanfolyamok oldalra.\n\nÜdv,\nTanfolyamok csapata`,
        html: `<p>Szia <strong>${felhasznalonev}</strong>!</p><p>Sikeresen regisztráltál tanárként a Tanfolyamok oldalra.</p><p>Üdv,<br>Tanfolyamok csapata</p>`,
      });
      emailSent = emailResult.sent;
    } catch (mailErr) {
      console.error("Email küldési hiba (nem blokkolja a regisztrációt):", mailErr);
    }

    res.json({ success: true, emailSent });
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
    
        const user = rows[0];
        // Ha van profilkép, hozzáadjuk az elérést
        if (user.profilkep) {
            user.profilkep = `/Tanfolyamok/kepek/${user.profilkep}`;
        }
    
        res.json({ success: true, user: user });
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
    // Ez a lekérdezés akkor is működik, ha az adatbázisban 'ár' vagy 'ar' van
    const [courses] = await db.promise().query("SELECT * FROM kepzesek");
    console.log("Küldött tanfolyamok száma:", courses.length); // Ezt nézd a terminálban!
    res.json(courses);
  } catch (err) {
    console.error("❌ MySQL Hiba a lekéréskor:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- KÉPFELTÖLTÉS BEÁLLÍTÁSA ---
// --- MULTER BEÁLLÍTÁS (ha még nincs bent) ---


// --- A JAVÍTOTT POST ÚTVONAL ---
app.post("/api/courses", uploadCourseImg.single('kep'), async (req, res) => {
  try {
    // Az oszlopnevek pontosan a te CREATE TABLE parancsodból:
    const { nev, leiras, helyileg, email, o_nev, heves_kortol, ua_ID, ar } = req.body;
    
   if (!req.file) {
    return res.status(400).json({ success: false, message: "Kép feltöltése kötelező!" });
}

// CSAK a fájl nevét mentjük el, az útvonalat nem!
const kepNev = req.file.filename; 

const sql = `INSERT INTO kepzesek 
             (kep, nev, leiras, helyileg, email, o_nev, heves_kortol, ua_ID, ar) 
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
    parseInt(ar) || 0
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

    const [[jelentkezesAdat]] = await db.promise().query(
      `SELECT v.nev as diak_nev, v.email as diak_email, k.nev as tanfolyam_nev
       FROM user_vevo v
       JOIN kepzesek k ON k.id = ?
       WHERE v.uv_id = ?
       LIMIT 1`,
      [kepzesId, userId]
    );

    let emailSent = false;
    if (jelentkezesAdat?.diak_email) {
      try {
        const emailResult = await sendMailSafe({
          to: jelentkezesAdat.diak_email,
          subject: "Sikeres tanfolyam jelentkezés",
          text: `Szia ${jelentkezesAdat.diak_nev}!\n\nSikeresen jelentkeztél erre a tanfolyamra: ${jelentkezesAdat.tanfolyam_nev}.\n\nÜdv,\nTanfolyamok csapata`,
          html: `<p>Szia <strong>${jelentkezesAdat.diak_nev}</strong>!</p><p>Sikeresen jelentkeztél erre a tanfolyamra: <strong>${jelentkezesAdat.tanfolyam_nev}</strong>.</p><p>Üdv,<br>Tanfolyamok csapata</p>`,
        });
        emailSent = emailResult.sent;
      } catch (mailErr) {
        console.error("Email küldési hiba (nem blokkolja a jelentkezést):", mailErr);
      }
    }

    res.json({ success: true, message: "Sikeres jelentkezés", emailSent });
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

        // Email küldés - ne befolyásolja a sikeres választ ha hibázik
        let emailSentToAdmin = false;
        let confirmationEmailSent = false;

        try {
          const adminMailResult = await sendMailSafe({
            to: MAIL_TO,
            subject: "Új üzenet a kapcsolat oldalról",
            text: `${nev} (${email}) küldte:\n\n${uzenet}`,
            html: `<p><strong>${nev}</strong> (${email}) küldte:</p><p>${String(uzenet).replace(/\n/g, "<br>")}</p>`,
            replyTo: email,
          });
          emailSentToAdmin = adminMailResult.sent;
        } catch (mailErr) {
          console.error("Admin email küldési hiba:", mailErr);
        }

        try {
          const senderMailResult = await sendMailSafe({
            to: email,
            subject: "Megkaptuk az üzeneted",
            text: `Szia ${nev}!\n\nKöszönjük az üzeneted, hamarosan válaszolunk.\n\nÜdv,\nTanfolyamok csapata`,
            html: `<p>Szia <strong>${nev}</strong>!</p><p>Köszönjük az üzeneted, hamarosan válaszolunk.</p><p>Üdv,<br>Tanfolyamok csapata</p>`,
          });
          confirmationEmailSent = senderMailResult.sent;
        } catch (mailErr) {
          console.error("Visszaigazoló email küldési hiba:", mailErr);
        }

        res.json({
          success: true,
          message: "Üzenet elmentve!",
          emailSentToAdmin,
          confirmationEmailSent,
        });
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

// ================= DIÁK JELENTKEZÉSEI =================
// Lekérdezi, hogy egy diák milyen tanfolyamokra jelentkezett
app.get("/api/diak/jelentkezesek/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        const sql = `
            SELECT 
                k.id as kepzes_id,
                k.nev as tanfolyam_nev,
                k.leiras,
                k.kep,
                k.email as oktato_email,
                k.o_nev as oktato_nev,
                j.jelentkezes_datum
            FROM jelentkezesek j
            JOIN kepzesek k ON j.kepzes_id = k.id
            WHERE j.user_id = ?
            ORDER BY j.jelentkezes_datum DESC
        `;
        
        const [rows] = await db.promise().query(sql, [userId]);
        res.json({ success: true, jelentkezesek: rows });
    } catch (err) {
        console.error("❌ Hiba a diák jelentkezéseinek lekérdezésekor:", err);
        res.status(500).json({ success: false, message: "Szerver hiba" });
    }
});

// ================= TANÁR TANFOLYAMAI ÉS JELENTKEZŐK =================
// Lekérdezi egy tanár összes tanfolyamát és hogy kik jelentkeztek rájuk
app.get("/api/tanar/tanfolyamok/:teacherId", async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        console.log("🔍 Tanár ID:", teacherId);
        
        // Lekérdezzük a tanár tanfolyamait (ua_ID mező alapján)
        const [tanfolyamok] = await db.promise().query(
            `SELECT id, kep, nev, leiras, helyileg, email, ar, heves_kortol
             FROM kepzesek 
             WHERE ua_ID = ?
             ORDER BY id DESC`,
            [teacherId]
        );
        
        console.log("📚 Talált tanfolyamok száma:", tanfolyamok.length);
        if (tanfolyamok.length > 0) {
            console.log("📋 Tanfolyamok:", tanfolyamok.map(t => `${t.nev} (ID: ${t.id})`));
        }
        
        // Minden tanfolyamhoz lekérdezzük a jelentkezőket
        for (let tanfolyam of tanfolyamok) {
            const [jelentkezok] = await db.promise().query(
                `SELECT 
                    v.uv_id,
                    v.nev,
                    v.email,
                    j.jelentkezes_datum
                 FROM jelentkezesek j
                 JOIN user_vevo v ON j.user_id = v.uv_id
                 WHERE j.kepzes_id = ?
                 ORDER BY j.jelentkezes_datum DESC`,
                [tanfolyam.id]
            );
            
            tanfolyam.jelentkezok = jelentkezok;
        }
        
        res.json({ success: true, tanfolyamok: tanfolyamok });
    } catch (err) {
        console.error("❌ Hiba a tanár tanfolyamainak lekérdezésekor:", err);
        res.status(500).json({ success: false, message: "Szerver hiba" });
    }
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
