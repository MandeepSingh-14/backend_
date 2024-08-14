import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import e from "cors"
// hme bhut baar use krna pd skta hai access tokens and refresh tokens so for that we are creating methods gfor this 
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


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

    const existedUser = await   User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser)
    {
        throw new ApiError(409, "User with username or email exist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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


const loginUser = asyncHandler(async (req,res) => {
     // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie


    const {email,username,password} = req.body;

    
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]   ///find krega ek value ko jha apko jo value hai vo ya to username ke base pe milegi ya email ke base pe 
    })

    if(!user)
        throw new ApiError(404,"User doesnot exist")

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,accessToken,refreshToken
                },
                "User Logged in successfully"
            )
        )

})


const logoutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { 
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )   
    const options = {
        httpOnly: true,
        secure: true
    }
        return res
        .status(200)
        .clearCookie("accessToken" ,options)
        .clearCookie("resfreshToken" ,options)
        .json(new ApiResponse(200,{},"User succeddfully logged out"))
    
})
export {
    registerUser,
    loginUser,
    logoutUser,
}