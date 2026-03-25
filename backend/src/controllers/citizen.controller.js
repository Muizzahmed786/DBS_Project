import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../database/index.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { upsertDocument } from '../utils/documentUpload.js';
const uploadDocuments = asyncHandler(async (req, res) => {

  let aadhaarLocalPath, rcLocalPath, insuranceLocalPath, dlLocalPath;

  const userId = req.user[0].user_id;
  const { vehicleId } = req.params;

  if (!req.files) {
    throw new ApiError(400, "At least one document needs to be uploaded");
  }
console.log(req.files)
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

export {uploadDocuments};