import express from "express";
import morgan from "morgan";
import "express-async-errors";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import mysql from "mysql2/promise";

const app = express();
const port = 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

const connection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
};

const secretKey = process.env.SECRET_KEY;

app.get("/info", (req, res) => {
  res.status(200).json({ message: "Success!" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const database = await connection();
    const [users] = await database.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Genera il token JWT dopo aver verificato correttamente le credenziali
    const jwtToken = jwt.sign({ userId: user.id }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Success!",
      apiToken: jwtToken,
      user, // Includi l'intero oggetto utente nella risposta
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/signup", async (req, res) => {
  const { username, email, phone, password } = req.body;

  // Verifica che tutti i campi siano forniti
  if (!username || !email || !phone || !password) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori." });
  }

  try {
    const database = await connection();

    // Controlla se l'email esiste già nel database
    const [existingUsers] = await database.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email già registrata." });
    }

    // Cifra la password
    const cryptedPassword = await bcrypt.hash(password, 10);

    // Inserisci il nuovo utente nel database
    const [insertResult] = await database.execute(
      "INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)",
      [username, email, phone, cryptedPassword]
    );

    // Recupera i dettagli dell'utente appena registrato, incluso il ruolo
    const [userResults] = await database.execute(
      "SELECT * FROM users INNER JOIN roles ON users.role_id = roles.id WHERE users.email = ?",
      [email]
    );

    const user = userResults[0];

    res.status(201).json({
      message: "Registrazione avvenuta con successo!",
      user: user, // Includi l'intero oggetto utente nella risposta
    });
  } catch (error) {
    res.status(500).json({
      message: "Errore durante la registrazione",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
