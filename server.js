import express from "express";
import Dbconnection from "./DbConnection/Db.js";
import router from "./Routes/userRoute.js";
import "dotenv/config";
import cors from 'cors';

const app = express();

Dbconnection();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://notepad-frontend-two.vercel.app",
    ],
    credentials: true,
  })
);
app.get("/", (req, res) => {
    res.send({ message: "Backend is running!" });
  });
app.use(express.json());
app.use("/api", router);

// 🔹 REMOVE app.listen when deploying to Vercel
export default app;