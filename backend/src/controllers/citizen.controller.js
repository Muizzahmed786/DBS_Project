import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../database/index.js';

const uploadDocuments = asyncHandler(async (req, res) => {

  // Validations:Vehicle shld be owned by user,
  //aadhaar,vehicle,licence no fetched from existing tables
  //
  let aadhaarLocalPath, rcLocalPath, insuranceLocalPath, dlLocalPath;
  let vehicleNo, aadhaarNo, insuranceNo, licenceNo, rcNo;

  const userId = req.user[0].user_id;

  if (!req.files) {
    throw new ApiError(400, "At least one document needs to be uploaded");
  }

  if (req.files.aadhaar) {
    aadhaarNo=await db.execute(`select aadhaar_number from users`)
    aadhaarLocalPath = req.files.aadhaar[0].path;
  }

  if (req.files.vehicleRc) {
    rcLocalPath = req.files.vehicleRc[0].path;
    vehicleNo = req.body.vehicleNo;
    rcNo = req.body.rcNo;
  }

  if (req.files.insurance) {
    insuranceLocalPath = req.files.insurance[0].path;
    insuranceNo = req.body.insuranceNo;
    vehicleNo = req.body.vehicleNo;
  }

  if (req.files.licence) {
    dlLocalPath = req.files.licence[0].path;
    licenceNo = req.body.licenceNo;
  }

  const aadhaarUrl = aadhaarLocalPath ? await uploadOnCloudinary(aadhaarLocalPath) : null;
  const licenceUrl = dlLocalPath ? await uploadOnCloudinary(dlLocalPath) : null;
  const insuranceUrl = insuranceLocalPath ? await uploadOnCloudinary(insuranceLocalPath) : null;
  const rcUrl = rcLocalPath ? await uploadOnCloudinary(rcLocalPath) : null;

  
  if (aadhaarUrl && aadhaarNo) {
    await upsertDocument({
      userId,
      type: "AADHAAR",
      number: aadhaarNo,
      url: aadhaarUrl
    });
  }

  if (licenceUrl && licenceNo) {
    await upsertDocument({
      userId,
      type: "DL",
      number: licenceNo,
      url: licenceUrl
    });
  }

  let vehicleId = null;

  if (insuranceUrl || rcUrl) {
    const [vehicle] = await db.execute(
      `SELECT vehicle_id FROM vehicles WHERE registration_number = ?`,
      [vehicleNo]
    );

    if (vehicle.length === 0) {
      throw new ApiError(400, "Vehicle not found");
    }

    vehicleId = vehicle[0].vehicle_id;

    const [ownedVehicles]=await db.execute(`select * from vehicle_ownership where vehicle_id=? and user_id=?`,[vehicleId,userId]);

    if(ownedVehicles.length===0){
      throw new ApiError(400,"Vehicle is not owned by the user");
    }
  }

  if (insuranceUrl && insuranceNo) {
    await upsertDocument({
      userId,
      vehicleId,
      type: "INSURANCE",
      number: insuranceNo,
      url: insuranceUrl
    });
  }

  if (rcUrl && rcNo) {
    await upsertDocument({
      userId,
      vehicleId,
      type: "RC",
      number: rcNo,
      url: rcUrl
    });
  }

  let userVehicleDocuments;

  if (vehicleId) {
    [userVehicleDocuments] = await db.execute(
      `SELECT * FROM documents WHERE user_id = ? OR vehicle_id = ?`,
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

export {uploadDocuments};