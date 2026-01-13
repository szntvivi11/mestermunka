const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ===== STATIKUS FÁJLOK =====
app.use(express.static(path.join(__dirname, "public")));
app.use("/bejelentkezes", express.static(path.join(__dirname, "bejelentkezes")));
app.use("/regisztracio", express.static(path.join(__dirname, "regisztracio")));
app.use("/kapcsolat", express.static(path.join(__dirname, "kapcsolat")));
app.use("/tanfolyamok/kepek", express.static(path.join(__dirname, "Tanfolyamok", "kepek")));
app.use("/tanfolyamok/oldalak", express.static(path.join(__dirname, "Tanfolyamok", "oldalak")));

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
  password: "",
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

// ---- USER (user_vevo) ----
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

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Adatbázis hiba" });
  }
});

// ---- TEACHER (user_ado) ----
// ---- TEACHER (user_ado) ----
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
      [felhasznalonev, email, hash, vegzettseg || null]
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
app.post("/api/login", async (req, res) => {
  const { email, jelszo } = req.body;

  if (!email || !jelszo)
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });

  try {
    // USER
    const [users] = await db.promise().query(
      "SELECT uv_id, nev, email, jelszo FROM user_vevo WHERE email = ?",
      [email]
    );

    if (users.length) {
      const user = users[0];
      const ok = await bcrypt.compare(jelszo, user.jelszo);
      if (!ok) return res.status(401).json({ success: false, message: "Hibás jelszó" });

      return res.json({
        success: true,
        role: "user",
        user: { id: user.uv_id, nev: user.nev, email: user.email }
      });
    }

    // TEACHER
    const [teachers] = await db.promise().query(
      "SELECT ua_id, felhasznalonev, gmail, jelszo FROM user_ado WHERE gmail = ?",
      [email]
    );

    if (!teachers.length)
      return res.status(401).json({ success: false, message: "Nincs ilyen felhasználó" });

    const teacher = teachers[0];
    const ok = await bcrypt.compare(jelszo, teacher.jelszo);
    if (!ok) return res.status(401).json({ success: false, message: "Hibás jelszó" });

    res.json({
      success: true,
      role: "teacher",
      user: { id: teacher.ua_id, nev: teacher.felhasznalonev, email: teacher.gmail }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Szerver hiba" });
  }
});

// ===== 404 =====
app.use((req, res) => {
  res.status(404).send("Az oldal nem található");
});

const ok = await bcrypt.compare(jelszo, user.jelszo);
console.log("LOGIN:", jelszo, user.jelszo, ok);

// ===== SERVER START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Szerver fut: http://localhost:${PORT}`)
);
