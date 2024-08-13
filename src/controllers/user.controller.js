import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    // get user detail from frontend (detail kya kya lunga ye mere m odel pe depend krege)
    // validation  check -not empty 
    // check if user already exists : username,email
    // check for files :avatar /coverimages
    //available then upload to cloudinary
    //major thing is we have to check whether avatar aaya ya nhi 
    // create user object - create entry in db 
    // remove password and refresh token field from response 
    // check respnse aaya hai ya nhi if yes then return else error

    const {fullName , email, username, password} =req.body
    console.log("email ", email);
    console.log("username ", username);

    // if(fullName === "")
    // {  
    //     throw new ApiError(400, "FullName is required")
    // } // we can use if else conditions as per our use bcz that not a bad approach too bt there can be more no of if else approaches so one more approach is there
    if(
        [fullName,email,username,password].some((field) =>
        field?.trim() ==="") // check ki field ko trim kr dijiye bt age uske baad bhi vo true bheja to khali tha 
    )
    {
        throw new ApiError(400,"all fields are required")
    }

    const existedUser = User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser)
    {
        throw new ApiError(409, "User with username or email ezist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar)
    {
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if(!createdUser)
    {
        throw new ApiError(500, "something went wrong while registering the user ")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Successfully"),

    )
})  


export {
    registerUser,
}