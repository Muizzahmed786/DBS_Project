import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connection } from "./db/index.js";

const app=express()
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true,
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.post('/api/users', async (req, res) => {
    const {id, name, roll_no} = req.body;
    const newUser = await connection.execute(
        `insert into student values (?, ?, ?)`,
        [id, name, roll_no]
    );

    console.log(res.json());

    res.json(newUser);
})

//Routes
export default app;