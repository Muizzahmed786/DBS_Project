import {Router} from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import {getAllRegisteredVehicles,getAllVehicleOwnershipDetails,getAllCitizens,getAllOfficers,getAllAdmins,getRtoVehicleOwnershipDetails,getRtoRegisteredVehicles,getChallansByStatus,getAllChallans,getAllPayments,getPaymentsByStatus, getTotalChallansCount,getTotalRevenue,getChallanCountByStatus,getAllRtoOffices,addRtoOffice,addViolationType,getAllAuditLogs,filterAuditLogs,deleteFilteredLogs,deleteOldestLogs,deleteLogsBetweenDates,countLogsBetweenDates} from "../controllers/admin.controller.js";
import {getAllViolationTypes} from "../controllers/user.controller.js"
const router=Router()
router.route("/get-all-violation-types").get(verifyJWT,getAllViolationTypes);
router.route("/get-all-citizens").get(verifyJWT,getAllCitizens)
router.route("/get-all-admins").get(verifyJWT,getAllAdmins)
router.route("/get-all-officers").get(verifyJWT,getAllOfficers)


router.route("/get-all-vehicles").get(verifyJWT,getAllRegisteredVehicles)
router.route("/get-rto-vehicles").post(verifyJWT,getRtoRegisteredVehicles)
router.route("/get-all-vehicle-ownership-details").get(verifyJWT,getAllVehicleOwnershipDetails)
router.route("/get-rto-vehicle-ownership-details").post(verifyJWT,getRtoVehicleOwnershipDetails)


router.route("/get-all-challans").get(verifyJWT,getAllChallans)
router.route("/get-challans-status/:status").get(verifyJWT,getChallansByStatus)


router.route("/get-all-payments").get(verifyJWT,getAllPayments)
router.route("/get-payments-status/:status").get(verifyJWT,getPaymentsByStatus)

router.route("/get-total-challans-count").get(verifyJWT,getTotalChallansCount)

router.route("/get-total-revenue").get(verifyJWT,getTotalRevenue)
router.route("/get-total-challan-count/:status").get(verifyJWT,getChallanCountByStatus)

router.route("/get-all-rto-offices").get(verifyJWT,getAllRtoOffices)
router.route("/add-rto-office").post(verifyJWT,addRtoOffice)
router.route("/add-violation-type").post(verifyJWT,addViolationType)

router.route("/audit-logs").get(verifyJWT, getAllAuditLogs);
router.route("/audit-logs/filter").get(verifyJWT, filterAuditLogs);
router.route("/audit-logs/filter").delete(verifyJWT, deleteFilteredLogs);
router.route("/audit-logs/oldest").delete(verifyJWT, deleteOldestLogs);
router.route("/audit-logs/date-range").delete(verifyJWT, deleteLogsBetweenDates);
router.route("/audit-logs/date-range/count").get(verifyJWT, countLogsBetweenDates);
export default router