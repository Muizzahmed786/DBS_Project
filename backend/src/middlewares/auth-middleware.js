import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// export const verifyJWT=asyncHandler(async(req,_,next)=>{
//   try {
//     // we have sent both access and refresh token via cookie, so can match via both but access token is mostly in req.header("Authorization")
//     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
  
//     if(!token){
//       throw new ApiError(401,"Unauthorized request")
//     }
  
//     const decodedToken=jwt.decode(token,process.env.ACCESS_TOKEN_SECRET)
//     console.log(decodedToken)
//     const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
  
//     if(!user){
//       throw new ApiError(401,"Invalid Access Token")
//     }
  
//     req.user=user; // add new object to req
//     next()
//   }
//   catch (error) {
//     throw new ApiError(401,error?.message || "Invalid access token")
//   }
// })