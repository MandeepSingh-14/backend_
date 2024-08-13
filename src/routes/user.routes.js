import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js";

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


export default router