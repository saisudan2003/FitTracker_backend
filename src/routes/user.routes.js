import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, updateUserProfileImage, verifyotp } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/changepassword").post(verifyJWT, changeCurrentPassword)
router.route("/currentuser").get(verifyJWT, getCurrentUser)
router.route("/updateaccount").patch(verifyJWT, updateUserDetails)
router.route("/updatepimage").patch(verifyJWT, upload.single("profile_pic"), updateUserProfileImage)
router.route("/verifyotp").get(verifyJWT,verifyotp)



export default router