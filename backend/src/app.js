import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "./database/index.js";

const app=express()
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true,
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//Common Routes
import userRouter from './routes/user.routes.js'
app.use("/api/v1/users",userRouter)

//Citizen only routes
import citizenRouter from './routes/citizen.routes.js';
app.use("api/v1/citizens",citizenRouter)

export default app;