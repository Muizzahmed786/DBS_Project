import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../database/index.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { upsertDocument } from '../utils/documentUpload.js';
import jwt from "jsonwebtoken";

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


const uploadDocuments = asyncHandler(async (req, res) => {
  let aadhaarLocalPath, rcLocalPath, insuranceLocalPath, dlLocalPath;
  const userId = req.user[0].user_id;
  const { vehicleId } = req.params;

  if (!req.files) {
    throw new ApiError(400, "At least one document needs to be uploaded");
  }

  if (req.files.aadhaar) {
    aadhaarLocalPath = req.files.aadhaar[0].path;
  }

  if (req.files.vehicleRc) {
    rcLocalPath = req.files.vehicleRc[0].path;
  }

  if (req.files.insurance) {
    insuranceLocalPath = req.files.insurance[0].path;
  }

  if (req.files.licence) {
    dlLocalPath = req.files.licence[0].path;
  }

  const aadhaarUrl = aadhaarLocalPath ? await uploadOnCloudinary(aadhaarLocalPath) : null;
  const licenceUrl = dlLocalPath ? await uploadOnCloudinary(dlLocalPath) : null;
  const insuranceUrl = insuranceLocalPath ? await uploadOnCloudinary(insuranceLocalPath) : null;
  const rcUrl = rcLocalPath ? await uploadOnCloudinary(rcLocalPath) : null;

  if (aadhaarUrl) {
    await upsertDocument({ userId, type: "AADHAAR", url: aadhaarUrl });
  }

  if (licenceUrl) {
    await upsertDocument({ userId, type: "DL", url: licenceUrl });
  }

  if (insuranceUrl || rcUrl) {
    if (!vehicleId) {
      throw new ApiError(400, "Vehicle ID required");
    }

    const [ownedVehicles] = await db.execute(
      `SELECT * FROM vehicle_ownership WHERE vehicle_id = ? AND user_id = ?`,
      [vehicleId, userId]
    );

    if (ownedVehicles.length === 0) {
      throw new ApiError(400, "Vehicle not owned by user");
    }
  }

  if (insuranceUrl) {
    await upsertDocument({
      userId,
      vehicleId,
      type: "INSURANCE",
      url: insuranceUrl
    });
  }

  if (rcUrl) {
    await upsertDocument({
      userId,
      vehicleId,
      type: "RC",
      url: rcUrl
    });
  }

  let userVehicleDocuments;

  if (vehicleId) {
    [userVehicleDocuments] = await db.execute(
      `SELECT * FROM documents 
       WHERE user_id = ? 
       AND (vehicle_id = ? OR vehicle_id IS NULL)`,
      [userId, vehicleId]
    );
  } else {
    [userVehicleDocuments] = await db.execute(
      `SELECT * FROM documents WHERE user_id = ?`,
      [userId]
    );
  }

  return res.status(200).json(
    new ApiResponse(200, { userVehicleDocuments }, "Documents updated successfully")
  );
});

export {getRegisteredVehicles,getAllChallans,getChallansByStatus, getMyProfile,getMyDocuments,uploadDocuments}