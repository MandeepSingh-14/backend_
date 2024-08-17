import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name || !name.trim().length ===0 ){
        throw new ApiError(401,"Playlist Name needed")
    }

    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id
    })

    if(!playlist){
        throw new ApiError(500 ,"Playlist not created")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Created Successfully"))


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(401, "Invalid user id")
    }
    const playlist = await Playlist.find({owner : userId})

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched Successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Invalid Playlist id")
    }
    const playlist = await Playlist.find({owner : playlistId})

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched Successfully by id"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401,"Playlist id or video id not found")
    }
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString() !== req.user?._id.toString){
        throw new ApiError(403,"Unauthorized to add video to playlist")
    }

    const updatedplaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos:videoId
        },
    })
    if (!updatedplaylist) {
        throw new ApiError(500, "video not added to playlist. Try again later ");
    }

    return res.status(200).json(new ApiResponse(200,updatedplaylist,"video added to pLaylist Successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401,"Playlist id or video id not found")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString){
        throw new ApiError(403,"Unauthorized to delete video in playlist")
    }
    
    const updatedplaylist = await Playlist.findByIdAndDelete(playlistId,
        {
            $pull:{
                videos : videoId
            }
        },
    {
        new: true
    });

    return res.status(200).json(new ApiResponse(200,updatedplaylist,"video deleted from pLaylist Successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"PlaylistId is invalid")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString){
        throw new ApiError(403,"Unauthorized to delete")
    }

    await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(500,"Playlist not deleted. Try again later!!")
    }
    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted Successfully"))
    
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"PlaylistId is invalid")
    }

    if(!name || !name.trim().length ===0 ){
        throw new ApiError(401,"Playlist Name needed")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(403,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString){
        throw new ApiError(403,"Unauthorized to update")
    }

    const updated = await Playlist.findByIdAndUpdate(
        playlistId,{
            $set:{
                name:name,
                description:description
            },
    },
    {
        new: true
    })

    if(!updated){
        throw new ApiError(500,"Playlist not updated. Try again later!!1")
    }
    return res.status(200).json(new ApiResponse(200,updated,"Playlist updated Successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}