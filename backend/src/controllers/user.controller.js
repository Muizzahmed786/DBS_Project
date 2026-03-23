import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from "jsonwebtoken";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../database/index.js';
import { hashPassword, isPasswordCorrect } from '../utils/auth.js';
import { generateAccessAndRefreshTokens } from '../utils/tokens.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { upsertDocument } from '../utils/documentUpload.js';
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

  if (createdUser.length == 0) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  res.status(201).json(
    new ApiResponse(201, createdUser[0], "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, aadhaar_number } = req.body
  if (!(email || aadhaar_number)) {
    throw new ApiError(400, "Email or Aadhaar number is required")
  }

  const [user] = await db.execute(
    `SELECT * FROM users WHERE email = ? OR aadhaar_number = ?`,
    [email, aadhaar_number]
  );

  if (user.length == 0) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await isPasswordCorrect(password, user[0].password_hash)

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user[0])

  const [loggedInUser] = await db.execute(`select user_id,full_name,mobile_number,role from users where user_id= ?`, [user[0].user_id])
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

const logoutUser = asyncHandler(async (req, res) => {
  const [loggedOutUser] = await db.execute(`select user_id from users where user_id= ?`, [req.user[0].user_id]);
  if (loggedOutUser.length == 0) {
    throw new ApiError(404, "User to be logged out not found");
  }

  await db.execute(`update users set refresh_token=NULL where user_id=?`, [loggedOutUser[0].user_id]);
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

  const incommingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }
  try {
    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const [user] = await db.execute('select user_id,refresh_token from users where user_id= ?', [decodedToken?.id]);
    if (user.length == 0) {
      throw new ApiError(401, "Invalid refresh token")
    }
    console.log(incommingRefreshToken)
    console.log(user[0].refresh_token)
    if (incommingRefreshToken !== user[0]?.refresh_token) {
      throw new ApiError(401, "Refresh Token is expired or used")
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user[0])
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed")
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Token")
  }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken}