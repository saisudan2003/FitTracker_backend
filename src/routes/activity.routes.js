import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addActivity, getActivity } from "../controllers/activity.controller.js";

const router = Router()

router.route("/addupdateactivity").post(verifyJWT, addActivity)
router.route("/getactivity").get(verifyJWT, getActivity)

export default router