import {Router} from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import {
  getRegisteredVehicles,
  getAllChallans,
  getChallansByStatus,
  getMyProfile,
  getMyDocuments
} from "../controllers/citizen.controller.js"
const router=Router()
router.route("/get-registered-vehicles").get(verifyJWT,getRegisteredVehicles)
router.route("/get-all-challans").get(verifyJWT,getAllChallans)
router.route("/get-all-challans/:status").get(verifyJWT,getChallansByStatus)
router.route("/get-my-profile").get(verifyJWT,getMyProfile);
router.route("/get-my-documents").get(verifyJWT,getMyDocuments);
export default router