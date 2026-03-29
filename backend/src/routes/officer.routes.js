import { Router } from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import { getMyIssuedChallans, getMyIssuedChallanCount, getIssuedDlCountByRto, issueChallan,issueDrivingLicence } from "../controllers/officer.controller.js";
import { getAllViolationTypes } from "../controllers/user.controller.js"

const router = Router();

router.route("/get-my-challan-issued").get(verifyJWT, getMyIssuedChallans);
router.route("/get-all-violation-types").get(verifyJWT, getAllViolationTypes);
router.route("/get-my-issued-challan-count").get(verifyJWT, getMyIssuedChallanCount);
router.route("/get-my-issued-dl-count/:rtoId").get(verifyJWT, getIssuedDlCountByRto);
router.route("/issue-challan").post(verifyJWT, issueChallan);
router.route("/issue-licence").post(verifyJWT, issueDrivingLicence);
export default router;