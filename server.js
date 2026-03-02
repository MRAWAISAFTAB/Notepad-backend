import express from "express";
import Dbconnection from "./DbConnection/Db.js";
const app = express();
import router from "./Routes/userRoute.js"
import "dotenv/config"
import cors from 'cors'

app.use(cors())


app.use(express.json());
Dbconnection();

const Port = process.env.PORT;

app.use("/api" , router)

app.listen(Port , () =>{
    console.log(`Server running on ${Port}`);
})

