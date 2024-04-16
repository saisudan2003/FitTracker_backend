import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({extended: true, limit: "50mb"}));
app.use(express.static("public"));
app.use(cookieParser());


//routes import
import userRouter from './routes/user.routes.js'
import activityRouter from './routes/activity.routes.js'
import foodRouter from './routes/food.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/activities", activityRouter)
app.use("/api/v1/food", foodRouter)

export {app}  