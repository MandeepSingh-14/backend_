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
    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Channel Id invalid");
    }

    try {
        const subscriber = await Subscription.aggregate([
            {
                $match:{
                    channel:mongoose.Schema.Types.ObjectId(channelId)
                },
            },
            {
                $lookup:{
                    from: "users,",
                    localField: "subscriber",
                    foreignField: "_id",
                    as:"usersubscribed"
                },
            },
            {
                $addFields:{
                    subs:{
                        $size:"$usersubscriber"
                    },
                },
            },
            {
                $project:{
                    subs: 1,
                    subscribercount: {
                      _id: 1,
                      fullname: 1,
                      username: 1,   
                    },
                },
            },
        ]);
    if (!subscriber || subscriber.length === 0) {
            return res.status(200).json(
              new Apisuccess(
                201,
                {subscriber},
                {
                  numberOfSubscribers : 0,
                  message : '0 Subscribers'
                }
              ),
            );
          }
return res.status(200).json(
        new Apisuccess(200, {subscriber}, "All subscribers fetched successfully"));
    } catch (error) {
        console.error("Error fetching subscribers:", error);
    throw new Apierror(500, "Something went wrong!");
  }
});
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new Apierror(400, "Invalid subscriber id");
      }
      const subscribed = await Subscription.aggregate([
        {
          $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "subscribed",
          },
        },
        {
          $addFields: {
            subscribed: {
              $first: "$subscribed",
            },
          },
        },
        {
          $addFields: {
            totalchannelsubscribed: {
              $size: "$subscribed",
            },
          },
        },
        {
          $project: {
            totalchannelsubscribed: 1,
            subscribed: {
              username: 1,
              fullname: 1,
            },
          },
        },
      ]);
      if (!subscribed || Object.entries(subscribed).length === 0) {
        throw new Apierror(404, "No channel subscribed");
      }
      return res.status(200).json(
        new Apisuccess(200, "All subscribed channel fetched successfully", {
          subscribed,
        }),
      );
    });

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}