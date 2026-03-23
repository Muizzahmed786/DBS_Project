import {Router} from "express";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import { upload } from "../middlewares/multer-middleware.js";
import { uploadDocuments } from "../controllers/citizen.controller.js";


const router=Router()
router.route("/upload-documents").post(verifyJWT,upload.fields([{name:"licence",maxCount:1},{name:"aadhaar",maxCount:1},{name:"insurance",maxCount:1},{name:"vehicleRc",maxCount:1}]),uploadDocuments)

export default router;