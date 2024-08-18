
import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
const router =Router()
router.use(verifyJWT)
router.route("/toggle/s/:channelId").post(toggleSubscription)
router.route("/toggle/cs/:channelId").get(getUserChannelSubscribers)
router.route("/toggle/sc/:subscriberId").get(getSubscribedChannels)


export default router