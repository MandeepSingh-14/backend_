import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Channel Id invalid");
    }

    try {
        const subscription = await Subscription.findOne({ channel: channelId, subscriber: userId });

        if (subscription) {
            await Subscription.findByIdAndDelete(subscription._id);
            return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"));
        } else {
            await Subscription.create({ channel: channelId, subscriber: userId });
            return res.status(200).json(new ApiResponse(200, "Subscribed successfully"));
        }
    } catch (error) {
        throw new ApiError(500, "Could not toggle subscription. Try again later.");
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}