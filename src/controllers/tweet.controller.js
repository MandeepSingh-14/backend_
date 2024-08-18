import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    
    if(!content || !content.trim().length ===0){
        throw new ApiError(401,"Enter content")
    }

    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(403,"not a valid user ")
    }

    const tweet = await Tweet.create({
        owner:req.user?._id,
        content:content
    });

    if(!tweet){
        throw new ApiError(500,"Try again later")
    }

    return res.status(200)
              .json(new ApiResponse( 200,tweet,"Tweet added Successfully"))
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} =req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(401,"Invalid userId")
    }

    const user= await User.findById(userId)
    if(!user){
        throw new ApiError(401,"User not exist")
    }

    const tweets = await Tweet.find({
        owner:userId
    })

    if(tweets.length === 0 ){
        throw new ApiError(404,"No tweet found")
    }

    return res.status(200)
        .json(new ApiResponse( 200,tweets,"Tweets fetched Successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} =req.params
    const { content }= req.body

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError (401,"Invalud Tweet id")
    }

    if(!content || content.trim().length === 0){
        throw new ApiError(401, "content cant be empty")
    }

    const verifyTweet = await Tweet.findById(tweetId)
    if(!verifyTweet){
        throw new ApiError(404 ," Tweet not found" )
    }

    if(verifyTweet?.owner.toString !== req.user?._id.toString){
        throw new ApiError(403,"not authorized to update")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content: content
            }
        },
        {new: true}
    );

    if(!tweet){
        throw new ApiError(500,"Try again later")
    }

    return res.status(200)
    .json(new ApiResponse(200,tweet,"Tweet updated Successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError (401,"Invalud Tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweetId){
        throw new ApiError (404,"Tweet not found")
    }

    if(tweet?.owner.toString !== req.user?._id.toString){
        throw new ApiError(403,"not authorized to delete")
    }
    
    await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(500,"Try again later")
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"Tweet deleted Successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}