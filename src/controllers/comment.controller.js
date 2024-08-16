import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} =req.body

    const video = await Video.findById(videoId) //db call to use await
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    
    const comment = await Comment.create({
        content:content,
        video: videoId,
        owner :req.user?._id
    })

    if(!comment)
    {
        throw new ApiError(500, "Cannot add comment")
    }

    return res.status(200)
        .json(new ApiResponse(200,comment,"Comment Added Successfuly"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content }= req.body

    if(!content || content.trim().length===0){
        throw new ApiError(401,"Content is empty")
    }

    const verifyComment = await Comment.findById(commentId)

    if(!verifyComment){
        throw new ApiError(404 ," Comment not found" )
    }

    if(verifyComment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400 ,"Only valid user can comment ")
    }

    const comment =  await Comment.findByIdAndUpdate(
        commentId,{
            $set: {
                $content : content
            }
        },{
            new:true
        }
    );

    if(!comment){
        throw new ApiError(500,"Comment not added")
    }


    return res.status(200).json(
        new ApiResponse(200,comment,"Comment Updated Successfully")
    )
})



const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    
    const comment  = await Comment.findById(commentId)
    if(!comment ){
        throw new ApiError(402,"Comment not found")
    }

    if(comment.owner.toString() !== req.user?._id.toString())
    {
        throw new ApiError(401,"Only valid user can delete the comment")
    }

    const newcomment = Comment.findByIdAndDelete(commentId)

    if(!newcomment){
        throw new ApiError(500,"Couldnt delete the comment")
    }
    return res.status(200)
    .json(new ApiResponse(200,newcomment, "Comment deleted successfully"))


})

export {
   // getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }