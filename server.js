const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");

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

// Add a route to serve the profile page
app.get("/profil", (req, res) => {
  res.sendFile(path.join(__dirname, "profil.html"));
});

// ===== ADATBÁZIS =====
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
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
          user: { id: student.uv_id, nev: student.nev, email: student.email }
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
          user: { id: teacher.ua_id, nev: teacher.felhasznalonev, email: teacher.gmail }
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
          user: { id: 0, nev: "Adminisztrátor", email: adminUsername }
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

// Add an endpoint to handle profile picture uploads
const upload = multer({ dest: "uploads/" });

app.post("/api/upload-profile-picture", upload.single("profilePicture"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  res.json({
    success: true,
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`
  });
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

// Endpoint to add a new course
app.post("/api/courses", async (req, res) => {
  const { nev, leiras, helyileg, email, ár, ua_ID } = req.body;

  if (!nev || !leiras || !helyileg || !email || !ár || !ua_ID) {
    return res.status(400).json({ success: false, message: "Hiányzó adatok" });
  }

  try {
    await db.promise().query(
      `INSERT INTO kepzesek (nev, leiras, helyileg, email, ár, ua_ID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nev, leiras, helyileg, email, ár, ua_ID]
    );

    res.json({ success: true, message: "Tanfolyam sikeresen hozzáadva" });
  } catch (err) {
    console.error("❌ Hiba a tanfolyam hozzáadásakor:", err);
    res.status(500).json({ success: false, message: "Szerver hiba" });
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


// ===== KAPCSOLATI ÜZENET MENTÉSE =====
app.post("/api/kapcsolat", async (req, res) => {
    const { nev, email, uzenet } = req.body;

    if (!nev || !email || !uzenet) {
        return res.status(400).json({ success: false, message: "Minden mező kitöltése kötelező!" });
    }

    try {
        await db.promise().query(
            "INSERT INTO uzenetek (nev, email, uzenet) VALUES (?, ?, ?)",
            [nev, email, uzenet]
        );
        res.json({ success: true, message: "Üzenet sikeresen elküldve!" });
    } catch (err) {
        console.error("Hiba az üzenet mentésekor:", err);
        res.status(500).json({ success: false, message: "Szerverhiba történt az üzenet küldésekor." });
    }
});
 

// ===== 404 =====
app.use((req, res) => {
  res.status(404).send("Az oldal nem található");
});


// ===== SERVER START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Szerver fut: http://localhost:${PORT}`)
);
