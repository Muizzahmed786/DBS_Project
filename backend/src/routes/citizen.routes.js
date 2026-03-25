import {Router} from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import { upload } from "../middlewares/multer-middleware.js";
import {
  getRegisteredVehicles,
  getAllChallans,
  getChallansByStatus,
  getMyProfile,
  getMyDocuments,
  uploadDocuments
} from "../controllers/citizen.controller.js"

const router=Router()
router.route("/get-registered-vehicles").get(verifyJWT,getRegisteredVehicles)
router.route("/get-all-challans").get(verifyJWT,getAllChallans)
router.route("/get-all-challans/:status").get(verifyJWT,getChallansByStatus)
router.route("/get-my-profile").get(verifyJWT,getMyProfile);
router.route("/get-my-documents").get(verifyJWT,getMyDocuments);
router.route("/upload-documents").post(verifyJWT,upload.fields([{name:"licence",maxCount:1},{name:"aadhaar",maxCount:1}]),uploadDocuments)
router.route("/upload-documents/:vehicleId").post(verifyJWT,upload.fields([{name:"insurance",maxCount:1},{name:"vehicleRc",maxCount:1}]),uploadDocuments)
export default router

