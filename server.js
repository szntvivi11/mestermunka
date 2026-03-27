const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cors());

// ===== STATIKUS FÁJLOK =====
app.use(express.static(path.join(__dirname, "public")));
app.use("/bootsrap", express.static(path.join(__dirname, "bootsrap")));
app.use("/bejelentkezes", express.static(path.join(__dirname, "bejelentkezes")));
app.use("/regisztracio", express.static(path.join(__dirname, "regisztracio")));
app.use("/kapcsolat", express.static(path.join(__dirname, "kapcsolat")));
app.use("/tanfolyamok", express.static(path.join(__dirname, "Tanfolyamok")));
app.use("/profil", express.static(path.join(__dirname, "profil_oldal")));
app.use("/rolunk", express.static(path.join(__dirname, "rolunk_oldal")));
app.use("/admin", express.static(path.join(__dirname, "admin_uzenetek")));
app.use("/admin_rendszer", express.static(path.join(__dirname, "admin_rendszer")));
app.use("/tanfolyamok/oldalak", express.static(path.join(__dirname, "Tanfolyamok", "oldalak")));
app.use('/Tanfolyamok/kepek', express.static(path.join(__dirname, 'Tanfolyamok', 'kepek')));
app.use('/tanfolyamok/kepek', express.static(path.join(__dirname, 'Tanfolyamok', 'kepek')));
app.use(express.static(path.join(__dirname, "profil_oldal")));
app.use("/jelszo-reset", express.static(path.join(__dirname, "jelszo-reset")));

// ===== HTML OLDALAK =====
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
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
  res.sendFile(path.join(__dirname, "profil_oldal", "profil.html"));
});
app.get("/rolunk", (req, res) => {
  res.sendFile(path.join(__dirname, "rolunk_oldal", "rolunk.html"));
});
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin_uzenetek", "admin.html"));
});
app.get("/admin_full.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin_rendszer", "admin_full.html"));
});
app.get("/jelszo-reset", (req, res) =>
  res.sendFile(path.join(__dirname, "jelszo-reset", "jelszo-reset.html"))
);

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
    console.error(" MySQL hiba:", err);
    process.exit(1);
  }
  console.log(" MySQL kapcsolat létrejött");
});


// ===== EMAIL KÜLDÉS (Nodemailer) =====
const MAIL_USER = process.env.MAIL_USER;
const MAIL_APP_PASS = (process.env.MAIL_APP_PASS || "").replace(/\s+/g, "").trim();
const MAIL_TO = process.env.MAIL_TO || MAIL_USER;

if (MAIL_USER && MAIL_APP_PASS && MAIL_APP_PASS.length !== 16) {
  console.warn(`FIGYELEM: MAIL_APP_PASS hossza hibás (${MAIL_APP_PASS.length}). Gmail app jelszó pontosan 16 karakter.`);
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
    console.warn("FIGYELEM: Email küldés kihagyva: MAIL_USER vagy MAIL_APP_PASS nincs beállítva.");
    return { sent: false, skipped: true };
  }

  try {
    await transporter.sendMail({
      from: `Mentora <${MAIL_USER}>`,
      to,
      subject,
      text,
      html,
      replyTo,
    });
    console.log(`Email sikeresen elküldve: ${to}`);
    return { sent: true, skipped: false };
  } catch (error) {
    console.error(`Email küldési hiba (${to}):`, error.message);
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
    const [exists] = await db.promise().query(
      "SELECT uv_id FROM user_vevo WHERE email = ?",
      [email]
    );

    if (exists.length)
      return res.status(400).json({ success: false, message: "Email már létezik" });

    const hash = await bcrypt.hash(jelszo, 10);

    await db.promise().query(
      `INSERT INTO user_vevo
       (nev, email, felhasznalonev, jelszo, regisztracio_datum)
       VALUES (?, ?, ?, ?, NOW())`,
      [nev, email, nev, hash]
    );

    let emailSent = false;
    try {
      const emailResult = await sendMailSafe({
        to: email,
        subject: "Sikeres regisztráció",
        text: `Szia ${nev}!\n\nSikeresen regisztráltál a Mentora oldalra.\n\nÜdv,\nMentora csapata`,
        html: `<p>Szia <strong>${nev}</strong>!</p><p>Sikeresen regisztráltál a Mentora oldalra.</p><p>Üdv,<br>Mentora csapata</p>`,
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


// ---- TANÁR (user_ado) ----
app.post("/api/register-teacher", async (req, res) => {
  const { felhasznalonev, email, jelszo, vegzettseg } = req.body;

  if (!felhasznalonev || !email || !jelszo || !vegzettseg)
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    const [exists] = await db.promise().query(
      "SELECT ua_id FROM user_ado WHERE gmail = ?",
      [email]
    );

    if (exists.length)
      return res.status(400).json({ success: false, message: "Email már létezik" });

    const hash = await bcrypt.hash(jelszo, 10);

    await db.promise().query(
      `INSERT INTO user_ado
       (felhasznalonev, gmail, jelszo, vegzettseg)
       VALUES (?, ?, ?, ?)`,
      [felhasznalonev, email, hash, vegzettseg]
    );

    let emailSent = false;
    try {
      const emailResult = await sendMailSafe({
        to: email,
        subject: "Sikeres tanári regisztráció",
        text: `Szia ${felhasznalonev}!\n\nSikeresen regisztráltál tanárként a Mentora oldalra.\n\nÜdv,\nMentora csapata`,
        html: `<p>Szia <strong>${felhasznalonev}</strong>!</p><p>Sikeresen regisztráltál tanárként a Mentora oldalra.</p><p>Üdv,<br>Mentora csapata</p>`,
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
async function isPasswordValid(inputPassword, storedPassword) {
  if (!storedPassword) return false;

  try {
    const bcryptOk = await bcrypt.compare(inputPassword, storedPassword);
    if (bcryptOk) return true;
  } catch (err) {
    // Régi vagy érvénytelen hash formátum; ilyenkor sima összehasonlításra váltunk.
  }

  return inputPassword === storedPassword;
}

app.post("/api/login", async (req, res) => {
  const { email, jelszo, role } = req.body;

  if (!email || !jelszo)
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    if (role === "student") {
      const [students] = await db.promise().query(
        "SELECT uv_id, nev, email, jelszo FROM user_vevo WHERE email = ?",
        [email]
      );

      if (students.length) {
        const student = students[0];
        const ok = await isPasswordValid(jelszo, student.jelszo);
        if (!ok) return res.status(401).json({ success: false, message: "Hibás jelszó" });

        return res.json({
          success: true,
          role: "student",
          user: { id: student.uv_id, nev: student.nev, email: student.email, role: "student" }
        });
      }
    } else if (role === "teacher") {
      const [teachers] = await db.promise().query(
        "SELECT ua_id, felhasznalonev, gmail, jelszo FROM user_ado WHERE gmail = ?",
        [email]
      );

      if (teachers.length) {
        const teacher = teachers[0];
        const ok = await isPasswordValid(jelszo, teacher.jelszo);
        if (!ok) return res.status(401).json({ success: false, message: "Hibás jelszó" });

        return res.json({
          success: true,
          role: "teacher",
          user: { id: teacher.ua_id, nev: teacher.felhasznalonev, email: teacher.gmail, role: "teacher" }
        });
      }
    } else if (role === "admin") {
      const [admins] = await db.promise().query(
        "SELECT id, username, password FROM admin WHERE username = ?",
        [email]
      );

      if (admins.length) {
        const admin = admins[0];
        const ok = await isPasswordValid(jelszo, admin.password);
        if (!ok) return res.status(401).json({ success: false, message: "Hibás jelszó" });

        return res.json({
          success: true,
          role: "admin",
          user: { id: admin.id, nev: admin.username, email: admin.username, role: "admin" }
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


// =====================================================
// ================== multer kepek=====================
// =====================================================
const storage = multer.diskStorage({
    destination: './Tanfolyamok/kepek/', 
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
const uploadCourseImg = multer({ storage: storage }); 
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
        if (user.profilkep) {
            user.profilkep = `/Tanfolyamok/kepek/${user.profilkep}`;
        }
    
        res.json({ success: true, user: user });
    } catch (err) {
        console.error("Profil lekérdezési hiba:", err);
        res.status(500).json({ success: false, message: "Szerver hiba" });
    }
});

// Profil frissítése (Kép és bemutatkozás)
app.post("/api/update-profile", upload.single('profilePicture'), async (req, res) => {
    try {
        const { id, role, bemutatkozas } = req.body;
        const profilkep = req.file ? req.file.filename : null;

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

        await db.promise().query(sql, params);

        res.json({ success: true, newPic: profilkep });
    } catch (err) {
        console.error("Profil frissítési hiba:", err);
        res.status(500).json({ error: "Szerver hiba történt a mentéskor." });
    }
});

// ===== TANFOLYAMOK API =====
app.get("/api/kepzesek", async (req, res) => {
  try {
    const [courses] = await db.promise().query("SELECT * FROM kepzesek");
    console.log("Küldött tanfolyamok száma:", courses.length); 
    res.json(courses);
  } catch (err) {
    console.error("MySQL hiba a lekéréskor:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

//============================================
//======= TANFOLYAM HOZZÁADÁSA (KÉPPEL) =======
//==========================================
app.post("/api/courses", uploadCourseImg.single('kep'), async (req, res) => {
  try {
    const { nev, leiras, helyileg, email, o_nev, heves_kortol, ua_ID, ar } = req.body;
    
   if (!req.file) {
    return res.status(400).json({ success: false, message: "Kép feltöltése kötelező!" });
}

const kepNev = req.file.filename; 

const sql = `INSERT INTO kepzesek 
             (kep, nev, leiras, helyileg, email, o_nev, heves_kortol, ua_ID, ar) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

await db.promise().query(sql, [
    kepNev,
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
    console.error("MySQL hiba:", err);
    res.status(500).json({ success: false, message: "Adatbázis hiba: " + err.sqlMessage });
  }
});


// =====================================================
// ===== JELENTKEZÉS MENTÉSE =====
//===============================================
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
      `SELECT 
        v.nev as diak_nev, 
        v.email as diak_email, 
        k.nev as tanfolyam_nev,
        k.helyileg as helyszin,
        k.o_nev as oktato_nev,
        COALESCE(ua.gmail, k.email) as oktato_email
       FROM user_vevo v
       JOIN kepzesek k ON k.id = ?
       LEFT JOIN user_ado ua ON ua.ua_id = k.ua_ID
       WHERE v.uv_id = ?
       LIMIT 1`,
      [kepzesId, userId]
    );

    // 1. Email a DIÁKNAK - sikeres jelentkezés visszaigazolása
    if (jelentkezesAdat?.diak_email) {
      try {
        await sendMailSafe({
          to: jelentkezesAdat.diak_email,
          subject: "Sikeres tanfolyam jelentkezés – Mentora",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#3399ff;">Sikeres jelentkezés! 🎉</h2>
              <p>Szia <strong>${jelentkezesAdat.diak_nev}</strong>!</p>
              <p>Sikeresen jelentkeztél az alábbi tanfolyamra:</p>
              <div style="background:#f0f4ff;padding:16px;border-left:4px solid #3399ff;border-radius:6px;margin:16px 0;">
                <p style="margin:4px 0;"><strong>Tanfolyam:</strong> ${jelentkezesAdat.tanfolyam_nev}</p>
                <p style="margin:4px 0;"><strong>Helyszín:</strong> ${jelentkezesAdat.helyszin || 'Nincs megadva'}</p>
                <p style="margin:4px 0;"><strong>Oktató:</strong> ${jelentkezesAdat.oktato_nev || 'Nincs megadva'}</p>
              </div>
              <p>Hamarosan felvesszük veled a kapcsolatot az oktató részéről.</p>
              <p>Üdv,<br><strong>Mentora csapata</strong></p>
            </div>
          `,
          text: `Szia ${jelentkezesAdat.diak_nev}!\n\nSikeresen jelentkeztél: ${jelentkezesAdat.tanfolyam_nev}\nHelyszín: ${jelentkezesAdat.helyszin || 'Nincs megadva'}\nOktató: ${jelentkezesAdat.oktato_nev || 'Nincs megadva'}\n\nÜdv,\nMentora csapata`,
        });
      } catch (mailErr) {
        console.error("Diák email küldési hiba:", mailErr);
      }
    }

    // 2. Email az OKTATÓNAK - új jelentkező értesítés
    if (jelentkezesAdat?.oktato_email) {
      try {
        await sendMailSafe({
          to: jelentkezesAdat.oktato_email,
          subject: `Új jelentkező – ${jelentkezesAdat.tanfolyam_nev}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#3399ff;">Új jelentkező érkezett! 📋</h2>
              <p>Szia <strong>${jelentkezesAdat.oktato_nev}</strong>!</p>
              <p>Valaki jelentkezett az egyik tanfolyamodra:</p>
              <div style="background:#f0f4ff;padding:16px;border-left:4px solid #3399ff;border-radius:6px;margin:16px 0;">
                <p style="margin:4px 0;"><strong>Tanfolyam:</strong> ${jelentkezesAdat.tanfolyam_nev}</p>
                <p style="margin:4px 0;"><strong>Jelentkező neve:</strong> ${jelentkezesAdat.diak_nev}</p>
                <p style="margin:4px 0;"><strong>Jelentkező emailje:</strong> ${jelentkezesAdat.diak_email}</p>
              </div>
              <p>A jelentkező adatait a profilodban, a tanfolyamaid között is megtekintheted.</p>
              <p>Üdv,<br><strong>Mentora csapata</strong></p>
            </div>
          `,
          text: `Új jelentkező: ${jelentkezesAdat.diak_nev} (${jelentkezesAdat.diak_email})\nTanfolyam: ${jelentkezesAdat.tanfolyam_nev}\n\nÜdv,\nMentora csapata`,
          replyTo: jelentkezesAdat.diak_email,
        });
      } catch (mailErr) {
        console.error("Oktató email küldési hiba:", mailErr);
      }
    }

    res.json({ success: true, message: "Sikeres jelentkezés" });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Már jelentkeztél erre a képzésre" });
    res.status(500).json({ success: false, message: "Szerverhiba" });
  }
});

// =====================================================
// ===== KAPCSOLATI ÜZENET MENTÉSE adatbázisba =====
// =====================================================
app.post("/api/kapcsolat", async (req, res) => {
    const { nev, email, uzenet } = req.body;
    if (!nev || !email || !uzenet) return res.status(400).json({ success: false, message: "Minden mező kitöltése kötelező!" });

    try {
        await db.promise().query("INSERT INTO uzenetek (nev, email, uzenet) VALUES (?, ?, ?)", [nev, email, uzenet]);

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
            text: `Szia ${nev}!\n\nKöszönjük az üzeneted, hamarosan válaszolunk.\n\nÜdv,\nMentora csapata`,
            html: `<p>Szia <strong>${nev}</strong>!</p><p>Köszönjük az üzeneted, hamarosan válaszolunk.</p><p>Üdv,<br>Mentora csapata</p>`,
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


// =====================================================
// ================= ADMIN FUNKCIÓK =================
// =====================================================
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
    const { email, nev, uzenet } = req.body;

    if (!email || !uzenet) {
        return res.status(400).json({ success: false, message: "Hiányzó email vagy üzenet!" });
    }

    try {
        const result = await sendMailSafe({
            to: email,
            subject: "Válasz az üzenetedre – Mentora",
            text: `${nev ? `Szia ${nev}!` : "Szia!"}\n\n${uzenet}\n\nÜdv,\nMentora csapata`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3399ff;">Válasz az üzenetedre</h2>
                    <p>${nev ? `Szia <strong>${nev}</strong>!` : "Szia!"}</p>
                    <div style="background: #f5f5f5; padding: 16px; border-left: 4px solid #3399ff; border-radius: 4px; margin: 16px 0;">
                        ${String(uzenet).replace(/\n/g, "<br>")}
                    </div>
                    <p>Üdv,<br><strong>Mentora csapata</strong></p>
                </div>
            `,
            replyTo: process.env.MAIL_USER,
        });

        if (result.skipped) {
            return res.status(500).json({ success: false, message: "Email küldés nincs beállítva a szerveren (MAIL_USER / MAIL_APP_PASS hiányzik)." });
        }

        if (!result.sent) {
            return res.status(500).json({ success: false, message: "Email küldési hiba: " + (result.error || "ismeretlen hiba") });
        }

        console.log(`Admin válasz elküldve: ${email}`);
        res.json({ success: true, message: "Válasz sikeresen elküldve!" });
    } catch (err) {
        console.error("Admin válasz küldési hiba:", err);
        res.status(500).json({ success: false, message: "Szerver hiba: " + err.message });
    }
});


// --- ADMIN EXTRA API-K ---
app.delete("/api/admin/kepzesek/:id", async (req, res) => {
    try {
        await db.promise().query("DELETE FROM kepzesek WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Tanár törlése
app.delete("/api/admin/tanarok/:id", async (req, res) => {
    try {
        // Először töröljük a tanár tanfolyamait
        await db.promise().query("DELETE FROM kepzesek WHERE ua_ID = ?", [req.params.id]);
        // Majd töröljük magát a tanárt
        await db.promise().query("DELETE FROM user_ado WHERE ua_id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error("Tanár törlési hiba:", err);
        res.status(500).json({ success: false });
    }
});

// Diák törlése
app.delete("/api/admin/diakok/:id", async (req, res) => {
    try {
        // Először töröljük a diák jelentkezéseit
        await db.promise().query("DELETE FROM jelentkezesek WHERE user_id = ?", [req.params.id]);
        // Majd töröljük magát a diákot
        await db.promise().query("DELETE FROM user_vevo WHERE uv_id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error("Diák törlési hiba:", err);
        res.status(500).json({ success: false });
    }
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
// Összes tanár lekérése
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
        console.error("Hiba a diák jelentkezéseinek lekérdezésekor:", err);
        res.status(500).json({ success: false, message: "Szerver hiba" });
    }
});

// ================= TANÁR TANFOLYAMAI ÉS JELENTKEZŐK =================
app.get("/api/tanar/tanfolyamok/:teacherId", async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        console.log("Tanár ID:", teacherId);
        
        const [tanfolyamok] = await db.promise().query(
            `SELECT id, kep, nev, leiras, helyileg, email, ar, heves_kortol
             FROM kepzesek 
             WHERE ua_ID = ?
             ORDER BY id DESC`,
            [teacherId]
        );
        
        console.log("Talált tanfolyamok száma:", tanfolyamok.length);
        if (tanfolyamok.length > 0) {
            console.log("Tanfolyamok:", tanfolyamok.map(t => `${t.nev} (ID: ${t.id})`));
        }

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
        console.error("Hiba a tanár tanfolyamainak lekérdezésekor:", err);
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

// =====================================================
// =========== ELFELEJTETT JELSZÓ ====================
// =====================================================

// In-memory token tárolás (egyszerű megoldás, szerver újraindítás törli)
const resetTokens = new Map();

// 1. Token generálás + email küldés
app.post("/api/forgot-password", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    let user = null;

    if (role === "student") {
      const [rows] = await db.promise().query(
        "SELECT uv_id as id, nev FROM user_vevo WHERE email = ?", [email]
      );
      if (rows.length) user = rows[0];
    } else if (role === "teacher") {
      const [rows] = await db.promise().query(
        "SELECT ua_id as id, felhasznalonev as nev FROM user_ado WHERE gmail = ?", [email]
      );
      if (rows.length) user = rows[0];
    }

    // Biztonsági okokból mindig sikert jelzünk, még ha nem létezik az email se
    if (!user) {
      return res.json({ success: true, message: "Ha létezik a fiók, elküldtük a levelet." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 30 * 60 * 1000; // 30 perc
    resetTokens.set(token, { userId: user.id, role, expires });

    const resetLink = `${process.env.BASE_URL || "http://localhost:3001"}/jelszo-reset?token=${token}&role=${role}`;

    await sendMailSafe({
      to: email,
      subject: "Jelszó visszaállítás – Mentora",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3399ff;">Jelszó visszaállítás</h2>
          <p>Szia <strong>${user.nev}</strong>!</p>
          <p>Kaptunk egy jelszó visszaállítási kérést a fiókoddal kapcsolatban.</p>
          <p>Kattints az alábbi gombra a jelszó megváltoztatásához:</p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#3399ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Jelszó visszaállítása</a>
          <p style="color:#888;font-size:0.9em;">A link 30 percig érvényes. Ha nem te kérted, hagyd figyelmen kívül ezt az emailt.</p>
          <p>Üdv,<br><strong>Mentora csapata</strong></p>
        </div>
      `,
      text: `Jelszó visszaállítás\n\nKattints ide: ${resetLink}\n\nA link 30 percig érvényes.`,
    });

    res.json({ success: true, message: "Ha létezik a fiók, elküldtük a levelet." });
  } catch (err) {
    console.error("Forgot password hiba:", err);
    res.status(500).json({ success: false, message: "Szerver hiba" });
  }
});

// 2. Token ellenőrzés
app.get("/api/reset-token-check", (req, res) => {
  const { token } = req.query;
  const data = resetTokens.get(token);
  if (!data || Date.now() > data.expires) {
    return res.json({ valid: false });
  }
  res.json({ valid: true, role: data.role });
});

// 3. Új jelszó mentése token alapján
app.post("/api/reset-password", async (req, res) => {
  const { token, jelszo } = req.body;
  if (!token || !jelszo) return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  const data = resetTokens.get(token);
  if (!data || Date.now() > data.expires) {
    return res.status(400).json({ success: false, message: "Érvénytelen vagy lejárt link." });
  }

  try {
    const hash = await bcrypt.hash(jelszo, 10);
    const tabla = data.role === "teacher" ? "user_ado" : "user_vevo";
    const col = data.role === "teacher" ? "ua_id" : "uv_id";

    await db.promise().query(`UPDATE ${tabla} SET jelszo = ? WHERE ${col} = ?`, [hash, data.userId]);
    resetTokens.delete(token);

    res.json({ success: true, message: "Jelszó sikeresen megváltoztatva!" });
  } catch (err) {
    console.error("Reset password hiba:", err);
    res.status(500).json({ success: false, message: "Szerver hiba" });
  }
});

// ===== 404 =====
app.use((req, res) => {
  res.status(404).send("Az oldal nem található");
});


// ===== SZERVER INDÍTÁSA =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Szerver fut: http://localhost:${PORT}`)
);
