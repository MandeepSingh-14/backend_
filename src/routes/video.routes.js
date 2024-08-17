import { Router } from "express";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideothumbnail } from "../controllers/video.controller.";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload } from "../middlewares/multer.middlewares.js"
const router = Router();

router.use(verifyJWT)

router.route("/publish_video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
        
    ]),
    publishAVideo
);
router.route("/:videoId").get(getVideoById)
router.route("/update-vid/:videoId").patch(upload.single("thumbnail"), updateVideo)
router.route("/delete-vid/:videoId").delete(deleteVideo)
router.route("/toggle/publish/:videId").post(togglePublishStatus)


export default router