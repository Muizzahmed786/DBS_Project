import {Router} from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import {getAllRegisteredVehicles,getAllVehicleOwnershipDetails,getAllCitizens,getAllOfficers,getAllAdmins,getRtoVehicleOwnershipDetails,getRtoRegisteredVehicles,getChallansByStatus,getAllChallans,getAllPayments,getPaymentsByStatus} from "../controllers/admin.controller.js";

const router=Router()

router.route("/get-all-citizens").get(verifyJWT,getAllCitizens)
router.route("/get-all-admins").get(verifyJWT,getAllAdmins)
router.route("/get-all-officers").get(verifyJWT,getAllOfficers)


router.route("/get-all-vehicles").get(verifyJWT,getAllRegisteredVehicles)
router.route("/get-rto-vehicles").get(verifyJWT,getRtoRegisteredVehicles)
router.route("/get-all-vehicle-ownership-details").get(verifyJWT,getAllVehicleOwnershipDetails)
router.route("/get-rto-vehicle-ownership-details").get(verifyJWT,getRtoVehicleOwnershipDetails)


router.route("/get-all-challans").get(verifyJWT,getAllChallans)
router.route("/get-challans-status/:status").get(verifyJWT,getChallansByStatus)


router.route("/get-all-payments").get(verifyJWT,getAllPayments)
router.route("/get-payments-status/:status").get(verifyJWT,getPaymentsByStatus)
export default router