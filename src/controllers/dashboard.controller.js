import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Likes } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId) {
    throw new ApiError(401, "invalid channelId");
  }
  try {
    const stats = await Video.aggregate([
      {
        $match: {
          owner: mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "videoId",
          foreignField: "_id",
          as: "liked",
        },
      },
      {
        $group: {
          _id: "owner",
          totalVideos: { sum: 1 },
          totalViews: { sum: "$views" },
          totalLikes: { sum: { $size: "$liked" } },
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_Id",
          foreignField: "channel",
          as: "subscribed",
        },
      },
      {
        $addFields: {
          totalSubscribers: { $size: "$subscribers" },
        },
      },
      {
        $project: {
          _id: 0,
          totalVideos: 1,
          totalViews: 1,
          totalLikes: 1,
          totalSubscribers: 1,
        },
      },
    ]);
    if (!stats || !stats.length === 0) {
      throw new ApiError(404, "Channel stats not found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, stats[0]),
        "Channel stats fetched successfully"
      );
  } catch (error) {
    throw new ApiError(500, "Could not fetch channel stats. Try again later.");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(401, "Invalid channel ID");
  }

  try {
    const videos = await Video.find({
      owner: mongoose.Types.ObjectId(channelId),
    });

    if (!videos || videos.length === 0) {
      throw new ApiError(404, "No videos found for this channel");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Channel videos fetched successfully", videos)
      );
  } catch (error) {
    throw new ApiError(500, "Could not fetch channel videos. Try again later.");
  }
});

export { getChannelStats, getChannelVideos };
