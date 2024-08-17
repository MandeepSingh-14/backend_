import { Router } from "express";
import { addComment, deleteComment, updateComment } from "../controllers/comment.controller";
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router =Router()
router.use(verifyJwt)
router.route("/:videoId".post(addComment))
router.route("/c/:commentId").patch(updateComment).patch(deleteComment)


export default router