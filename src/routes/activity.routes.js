import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addActivity } from "../controllers/activity.controller.js";

const router = Router()

router.route("/addupdateactivity").post(verifyJWT, addActivity)

export default router