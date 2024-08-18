import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !title.trim().length ===0){
        throw new ApiError(401,"Title should be there")
    }
    if(!description || !description.trim().length ===0){
        throw new ApiError(401,"Description should be there")
    }

    const videoPath = req.files?.videoFile[0]?.path;
    const thumbnailPath = req.files?.thumbnailFile[0]?.path

    if(!videoPath)
        {
            throw new ApiError(400,"Video is required")
        }
    if(!thumbnailPath)
        {
            throw new ApiError(400,"Thumbnail is required")
        }
    
    const videoupload = await uploadOnCloudinary(videoPath)
    const thumbnailupload = await uploadOnCloudinary(thumbnailPath)

    if(!videoupload)
        {
            throw new ApiError(400,"Video is required")
        }
    if(!thumbnailupload)
        {
            throw new ApiError(400,"Thumbnail is required")
        }
    
    const video = await Video.create(
        {
            videoFile: videoupload.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration:video.duration,
            isPublished:true,
            owner:req.user?._id,
        }
    );
    if(!video){
        throw new ApiError(500, "Cannot upload.. Try again later!!!")
    }

    return res.status(200).json(200,video,"Video uploaded successfully")
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"video ID invalid")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found or not existing")
    }

    return res.status(200).json(200,video,"Video fetched by id successfully")
})

const updateVideothumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"video ID invalid")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found or not existing")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"only authorized user is allowed to update video")
    }

    const thumbnailPath = req.files?.thumbnailFile[0]?.path
    if(!thumbnailPath)
        {
            throw new ApiError(400,"Thumbnail is required")
        }
    
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    
    if(!thumbnail)
        {
            throw new ApiError(400,"Thumbnail is required")
        }
    
    const updatedThumbnail = await Video.findByIdAndUpdate(
        videoId ,{
            $set:{
                thumbnail:thumbnail
            },
        },
        {new:true}
        );
    
    if(!updatedThumbnail){
        throw new ApiError(500, "Can't update.. Try again updated")
    }

    return res
    .json(new ApiResponse(200,updatedThumbnail,"thumbnail updated"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"video ID invalid")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found or not existing")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"only authorized user is allowed to delete video")
    }
    await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new ApiError(500, "Can't delete.. Try again updated")
    }

    return res
    .json(new ApiResponse(200,video,"video deleted"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"video ID invalid")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found or not existing")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"only authorized user is allowed to delete video")
    }

    const update = await Video.findByIdAndUpdate(
        videoId,{
            $set:{
                isPublished: !isPublished
            },
        },
        {
            new:true
        }
    );
    if(!update){
        throw new ApiError(500, "Can't delete.. Try again updated")
    }

    return res
    .json(new ApiResponse(200,video,"video toggling is done"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideothumbnail,
    deleteVideo,
    togglePublishStatus
}