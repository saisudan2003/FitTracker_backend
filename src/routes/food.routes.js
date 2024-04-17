import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Addfood,getFood } from "../controllers/food.controller.js";

const router = Router()

router.route("/addfooditem").post(verifyJWT, Addfood)
router.route("/getfood").get(verifyJWT, getFood)

export default router