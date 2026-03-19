import { ApiError } from "./ApiError.js";
import jwt from "jsonwebtoken";
import { db } from "../database/index.js";
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      fullName: user.full_name
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};


const generateAccessAndRefreshTokens = async function (user) {
  //user is on object 
  try {
    if (!user) {
      throw new ApiError(404, "User not found")
    }
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
   
    await db.execute(
      "UPDATE users SET refresh_token = ? WHERE user_id = ?",
      [refreshToken, user.user_id]
    )

    return { accessToken, refreshToken }

  } catch (error) {
    console.error(error)
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    )
  }
}

export {generateAccessAndRefreshTokens};