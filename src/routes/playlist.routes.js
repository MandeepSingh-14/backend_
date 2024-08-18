import { Router } from "express";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT);

router.route('/create-playlist').post(createPlaylist)
router.route('/user/:userId').get(getUserPlaylists)
router.route('/:playlistId').get(getPlaylistById)
router.route('/add/:videoId/:playlistId').patch(addVideoToPlaylist)
router.route('/delete/:videoId/:playlistId').delete(removeVideoFromPlaylist)
router.route('/:playlistId').delete(deletePlaylist)
router.route('/:playlistId').patch(updatePlaylist)


export default router
