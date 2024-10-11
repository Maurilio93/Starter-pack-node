import express from "express";
import morgan from "morgan";
import "express-async-errors";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import mysql from 'mysql'

const app = express();
const port = 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect((error) => {
  if (error) {
    console.log("Database error");
    return;
  }
  console.log('Database success');

});

app.get("/info", (req, res) => {
  res.status(200).json({ message: "Success!" });
});

const secretKey = process.env.SECRET_KEY;

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const jwtToken = jwt.sign({ userId: 20 }, secretKey, { expiresIn: "1h" });
  const cryptedPassword = await bcrypt.hash(password, 10);

  res.status(200).json({
    message: "Success!",
    apiToken: jwtToken,
    username: username,
    password: cryptedPassword,
  });
});

app.post("/signup", async (req, res) => {
  const { username, email, phone, password } = req.body;
  //Cripto la password per poi salvarla nel database

  const cryptedPassword = await bcrypt.hash(password, 10);

  res.status(200).json({
    message: "Success!",
    username: username,
    password: cryptedPassword,
    email: email,
    phone: phone,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
