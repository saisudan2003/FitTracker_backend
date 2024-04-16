//require ("dotenv").config({path: "../.env"})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
  path: "./env"
})

connectDB()
.then(() => {
  console.log("MongoDB connected")
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Listening on port ${process.env.PORT}`)
  })
})
.catch((error) => {
  console.log("MONGODB connection failed", error)
})























// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import experss from "express"

// const app = experss();

// ;(async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on('error', (error) => {
//      console.error("ERR", error);
//      throw error
//     })
//     app.listen(process.env.PORT, () => {
//       console.log(`Listening on port ${process.env.PORT}`)
//     })
//   } catch (error) {
//     console.log(error)
//   }
// })()