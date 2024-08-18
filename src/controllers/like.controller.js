import mongoose, { isValidObjectId } from "mongoose";
import { Likes } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "video ID invalid");
  }

  const existlike = await Likes.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existlike) {
    await Likes.findByIdAndDelete(existlike?._id);

    return res.json(new ApiResponse(200, existlike, "liKE DELETED"));
  } else {
    await Likes.create({
      videoId: videoId,
      likedBy: req.user?._id,
    });
    return res.json(new ApiResponse(200, existlike, "like done"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(401, "Comment ID invalid");
  }

  const existlike = await Likes.findOne({
    comment: commentIdId,
    likedBy: req.user?._id,
  });

  if (existlike) {
    await Likes.findByIdAndDelete(existlike?._id);

    return res.json(new ApiResponse(200, existlike, "liKE DELETED"));
  } else {
    await Likes.create({
      videoId: videoId,
      likedBy: req.user?._id,
    });
    return res.json(new ApiResponse(200, existlike, "like done"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Tweet ID invalid");
  }

  const existlike = await Likes.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (existlike) {
    await Likes.findByIdAndDelete(existlike?._id);

    return res.json(new ApiResponse(200, existlike, "liKE DELETED"));
  } else {
    await Likes.create({
      videoId: videoId,
      likedBy: req.user?._id,
    });
    return res.json(new ApiResponse(200, existlike, "like done"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Likes.aggregate([
    {
      $match: {
        likedby: req.user?._id, //$match: Filters the documents in the Likes collection to
        //only include those where the likedby field matches the current user's ID (req.user?._id).
      },
    },
    {
      $lookup: {
        //$lookup: Performs a join operation between the Likes collection and the videos collection.
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "like",
      },
    },
    {
      $addFields: {
        totallikedbyuser: {
          $size: "$like",
        },
      },
      // $addFields: Adds a new field to each document in the aggregation result.
      // totallikedbyuser: The name of the new field being added. It represents the total number of videos liked by the user.
      // $size: An aggregation operator that counts the number of elements in the like array.
      // "$like": Refers to the like field added by the $lookup stage.
    },
    {
      $project: {
        likedby: 1,
        totallikedbyuser: 1,
        like: 1,
      },
      //$project: Specifies which fields should be included or excluded in the final output.
      // likedby: 1: Includes the likedby field in the output (1 means include).
      // totallikedbyuser: 1: Includes the totallikedbyuser field in the output.
      // like: 1: Includes the like field in the output.
    },
  ]);
  if (!likedVideos || likedVideos.length === 0) {
    throw new Apierror(404, "Couldn't find liked videos");
  }
  return res.status(200).json(
    new Apisuccess(200, "Fetched all the liked video successfully", {
      likedVideos,
    })
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
