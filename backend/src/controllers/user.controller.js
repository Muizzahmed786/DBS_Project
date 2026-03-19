import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {db }from '../database/index.js';
import { hashPassword,isPasswordCorrect } from '../utils/auth.js';
import { generateAccessAndRefreshTokens } from '../utils/tokens.js'; 

const registerUser = asyncHandler(async (req, res) => {
  const { full_name, mobile_number, email, aadhaar_number, password, role } = req.body;
  const userRole = role ?? "citizen";

  const userDetails = [full_name, mobile_number, email, aadhaar_number, password, userRole];
  
  userDetails.forEach((details) => {
    if (!details || details.trim() === "") {
      throw new ApiError(400, "All fields are required");
    }
  });

  const [existedUser] = await db.execute(
    `SELECT * FROM users WHERE email = ? OR aadhaar_number = ?`,
    [email, aadhaar_number]
  );

  if (existedUser.length > 0) {
    throw new ApiError(409, "User with email or aadhaar already exists");
  }

  const password_hash = await hashPassword(password)

  const user = await db.execute(
    `INSERT INTO users (full_name, mobile_number, email, aadhaar_number, password_hash, role) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [full_name, mobile_number, email, aadhaar_number, password_hash, userRole]
  );

  console.log(user);

  const [createdUser] = await db.execute(
    `SELECT user_id, full_name, mobile_number, email, aadhaar_number, role, created_at 
     FROM users WHERE email = ?`,
    [email]
  );
  
  if (createdUser.length==0) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }
  
  res.status(201).json(
    new ApiResponse(201, createdUser[0], "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email,password,aadhaar_number } = req.body
  if (!( email || aadhaar_number)) {
    throw new ApiError(400, "Email or Aadhaar number is required")
  }

  const [user] = await db.execute(
    `SELECT * FROM users WHERE email = ? OR aadhaar_number = ?`,
    [email, aadhaar_number]
  );

  if (user.length==0) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await isPasswordCorrect(password,user[0].password_hash)

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user[0])

  const [loggedInUser] =  await db.execute(`select user_id,full_name,mobile_number,role from users where user_id= ?` ,[user[0].user_id])
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options) 
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken: accessToken, refreshToken: refreshToken }, "User Logged In Successfully")
    )
  
})

// const logoutUser = asyncHandler(async (req, res) => {
//   // clear cookies
//   // delete ref token from db
//   //req.user can be accssed bcz jwt middle ware runs before this

//   await User.findByIdAndUpdate(
//     await req.user._id,
//     {
//       $set: {
//         refreshToken: undefined
//       }
//     },
//     {
//       new: true
//     }
//   )

//   const options = {
//     httpOnly: true,
//     secure: true
//   }

//   return res
//     .status(200)
//     .clearCookie("accessToken", options)
//     .clearCookie("refreshToken", options)
//     .json(new ApiResponse(200, {}, "User Logged Out"))
// })

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   // after some time access token with user expires, then we match the refresh token with user and in our db, then we send new access token to user and create new refresh token and send both to user and db
//   // time of access< refresh
//   const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

//   if (!incommingRefreshToken) {
//     throw new ApiError(401, "Unauthorized request")
//   }
//   try {
//     const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
//     //we need to decode the token to extract he info saved in it
//     const user = await User.findById(decodedToken?._id)
//     if (!user) {
//       throw new ApiError(401, "Invalid refresh token")
//     }

//     if (incommingRefreshToken !== user?.refreshToken) {
//       throw new ApiError(401, "Refresh Token is expired or used")
//     }
//     const options = {
//       httpOnly: true,
//       secure: true
//     }
//     const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
//     return res.status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", newrefreshToken)
//       .json(
//         new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed")
//       )
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid Token")
//   }
// })

export {registerUser,loginUser}