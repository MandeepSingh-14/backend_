import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }, // same hona chahaiye fromt ens me 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),   //jaate hue milke jaana     
    registerUser
)


router.route("/login").post(loginUser)



//securedroutes
router.route("/logout").post(verifyJWT , logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router