import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import nodemailer from "nodemailer"
import Mailgen from "mailgen"
//const nodemailer = require("nodemailer");
//const Mailgen = require('mailgen')

const generateAccessAndRefereshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating refresh and access tokens"
      );
    }
  };


const registerUser = asyncHandler(async (req,res) => {
    const {username,email,password,phoneno} = req.body
    //console.log("email: ", email)

    if([username,email,password,phoneno].some((field) => field?.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [
            {username},
            {email}
        ]
    })

    if(existingUser){
        throw new ApiError(409,"User with the same username or email already exists")
    }

    //const profile = req.files?.profile_pic[0]?.path
    // if(!profile){
    //     throw new ApiError(400,"Profile picture is required")
    // }

    //const profileCloudinary= await uploadOnCloudinary(profile)
    // if(!profileCloudinary){
    //     throw new ApiError(400,"Profile picture is required")
    // }

    const user = await User.create({
        username: username,
        email: email,
        password: password,
        phoneno: phoneno
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse("User created successfully",createdUser,201
    ))  
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password } = req.body;
    if ((!username && !email) || !password) {
      throw new ApiError(400, "Username/email and password are required");
    }
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (!user) {
      throw new ApiError(404, "User not found with this username");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid username or password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
  
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  });

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
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
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
  })
  
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})
  
const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateUserDetails = asyncHandler(async(req, res) => {
    const {username, email, phoneno, height, weight, gender} = req.body

    if (!username && !email && !phoneno && !height && !weight && !gender) {
        throw new ApiError(400, "No fields in update request")
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (phoneno) updateFields.phoneno = phoneno;
    if (height) updateFields.height = height;
    if (weight) updateFields.weight = weight;
    if (gender) updateFields.gender = gender;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateFields },
        { new: true }
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserProfileImage = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const profile_pic = await uploadOnCloudinary(avatarLocalPath)

    if (!profile_pic.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                profile_pic: profile_pic.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const verifyotp = asyncHandler(async (req, res) => {
    const email = req.user?.email
    const otp = Math.floor(100000 + Math.random() * 900000);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });
    let MailGenerator = new Mailgen({
        theme: "default",
        product:{
            name: "FitTracker",
            link: 'https://mailgen.js/'
        }
    })
    let response = {
        body: {
            name: email,
            intro: "Welcome to FitTracker! We're very excited to have you on board.",
            table: {
                data: [
                    {
                        name: "OTP Code",
                        value: otp,
                    }
                ],
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    }

    let mg = MailGenerator.generate(response)

    let message = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "OTP Code",
        html: mg,
    }

    let info = await transporter.sendMail(message)

    if(!info){
        throw new ApiError(400, "Error while sending email")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, info, "Email sent successfully")
    )    
})

  
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserProfileImage,
    verifyotp}