import {Router} from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import { upload } from "../middlewares/multer-middleware.js";
import {
  getRegisteredVehicles,
  getAllChallans,
  getChallansByStatus,
  getMyProfile,
  getMyDocuments,
  uploadDocuments,
  getMyChallanCount,
  getMyChallanByStatusCount,
  getMyVehiclesCount,
  getMyPaymentCount,
  getMyPaymentByStatusCount,
  makePayment,
  getMyPaymentHistory,
  insertVehicle
} from "../controllers/citizen.controller.js"

const router=Router()
router.route("/get-registered-vehicles").get(verifyJWT,getRegisteredVehicles)
router.route("/get-all-challans").get(verifyJWT,getAllChallans)
router.route("/get-all-challans/:status").get(verifyJWT,getChallansByStatus)
router.route("/get-my-profile").get(verifyJWT,getMyProfile);
router.route("/get-my-documents").get(verifyJWT,getMyDocuments);
router.route("/upload-documents").post(verifyJWT,upload.fields([{name:"licence",maxCount:1},{name:"aadhaar",maxCount:1}]),uploadDocuments)
router.route("/upload-documents/:vehicleId").post(verifyJWT,upload.fields([{name:"insurance",maxCount:1},{name:"vehicleRc",maxCount:1}]),uploadDocuments)

router.route("/get-my-total-challan-count").get(verifyJWT,getMyChallanCount);
router.route("/get-my-total-challan-count/:status").get(verifyJWT,getMyChallanByStatusCount);
router.route("/get-my-vehicle-count").get(verifyJWT,getMyVehiclesCount);
router.route("/get-my-payment-count").get(verifyJWT,getMyPaymentCount);
router.route("/get-my-payment-count/:status").get(verifyJWT,getMyPaymentByStatusCount);
router.route("/get-my-payment-history").get(verifyJWT,getMyPaymentHistory);
router.route("/insert-vehicle").post(verifyJWT,insertVehicle);
router.route("/make-payment/:challan_id").post(verifyJWT,makePayment);
export default router

