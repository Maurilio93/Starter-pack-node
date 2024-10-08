import express from "express";
import morgan from "morgan";
import "express-async-errors";

const app = express();
const port = 3000;

app.use(morgan("dev"));
app.use(express.json());


app.get("/info", (req,res) => {
  res.status(200).json({ message: "Success!" });
});


app.post("/login", (req, res) => {
  const token = "bgstgtwgwrtrwrw";
  const { username, password } = req.body;
  res.status(200).json({
    message: "Success!",
    apiToken: token,
    username: username,
    password: password,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
