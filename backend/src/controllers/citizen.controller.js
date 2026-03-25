import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from "jsonwebtoken";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {db }from '../database/index.js';

const getRegisteredVehicles=asyncHandler(async (req,res)=>{
  if(req.user[0].role!=='citizen'){
    throw new ApiError(400,"Unauthorized request")
  }

  const [registerdVehicles]=await db.execute(`
    SELECT 
    vo.ownership_start_date,
    vo.ownership_end_date,

    v.*,

    u.user_id,
    u.full_name,
    u.mobile_number,
    u.email

    FROM vehicle_ownership vo
    JOIN users u ON vo.user_id = u.user_id
    JOIN vehicles v ON v.vehicle_id = vo.vehicle_id
    where u.user_id=?; 
  `,[req.user[0].user_id])
  return res.status(200).json(new ApiResponse(200,registerdVehicles,"All the registered vehicles fetched"))
})
const getAllChallans=asyncHandler(async (req,res)=>{
  if(req.user[0].role!=='citizen'){
    throw new ApiError(400,"Unauthorized request")
  }
  const [allChallans]=await db.execute(`
      SELECT 
    c.challan_id,
    c.dl_id,
    c.violation_type_id,
    c.violation_date,
    c.status,
    c.total_amount,

    v.*,

    dl.licence_number,

    u.user_id,
    u.full_name,
    u.mobile_number,

    vt.description,
    vt.penalty_amount AS default_fine

FROM challan c
JOIN vehicles v ON c.vehicle_id = v.vehicle_id
JOIN driving_licence dl ON c.dl_id = dl.dl_id
JOIN users u ON dl.user_id = u.user_id
JOIN violation_types vt ON vt.violation_type_id = c.violation_type_id
where u.user_id=?;
    `,[req.user[0].user_id])
    return res.status(200).json(new ApiResponse(200,allChallans,"All Challans fetched successfully"))
})
const getChallansByStatus=asyncHandler(async (req,res)=>{
  if(req.user[0].role!=='citizen'){
    throw new ApiError(400,"Unauthorized request")
  }
  const {status}=req.params;
  if(!["pending","paid"].includes(status));
  const [allChallans]=await db.execute(`
      SELECT 
    c.challan_id,
    c.dl_id,
    c.violation_type_id,
    c.violation_date,
    c.status,
    c.total_amount,

    v.*,

    dl.licence_number,

    u.user_id,
    u.full_name,
    u.mobile_number,

    vt.description,
    vt.penalty_amount AS default_fine

FROM challan c
JOIN vehicles v ON c.vehicle_id = v.vehicle_id
JOIN driving_licence dl ON c.dl_id = dl.dl_id
JOIN users u ON dl.user_id = u.user_id
JOIN violation_types vt ON vt.violation_type_id = c.violation_type_id
where u.user_id=? and c.status=?;
    `,[req.user[0].user_id,status])
    return res.status(200).json(new ApiResponse(200,allChallans,`All Challans with ${status} status fetched successfully`))
})
const getMyProfile=asyncHandler(async (req,res)=>{
  if(req.user[0].role!=='citizen'){
    throw new ApiError(400,"Unauthorized request")
  }
  const [profile]=await db.execute('select user_id,full_name,mobile_number,email,aadhaar_number,created_at as registered_at from users where user_id=? ',[req.user[0].user_id]);

  if(profile.length==0){
    throw new ApiError(400,"User does not exist")
  }
  profile[0].readablePassword=
  console.log(profile);
  return res.status(200).json(new ApiResponse(200,profile,"Profile fetched successfully"))
})
const getMyDocuments=asyncHandler(async (req,res)=>{
  if(req.user[0].role!=='citizen'){
    throw new ApiError(400,"Unauthorized request")
  }
  const [documents]=await db.execute('select * from documents where user_id=?',[req.user[0].user_id])
  return res.status(200).json(new ApiResponse(200,documents,"Documents fetched successfully"))
})

export {getRegisteredVehicles,getAllChallans,getChallansByStatus, getMyProfile,getMyDocuments}