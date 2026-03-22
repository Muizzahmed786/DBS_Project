import {Router} from "express";
import { 
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  uploadDocuments
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import { upload } from "../middlewares/multer-middleware.js";

const router=Router()
router.route('/register').post(
registerUser
)
router.route('/login').post(
loginUser
)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(verifyJWT,refreshAccessToken)
router.route("/upload-documents").post(verifyJWT,upload.fields([{name:"licence",maxCount:1},{name:"aadhaar",maxCount:1},{name:"insurance",maxCount:1},{name:"vehicleRc",maxCount:1}]),uploadDocuments)
export default router