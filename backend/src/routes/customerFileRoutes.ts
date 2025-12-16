import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { uploadVehicleFile, uploadHealthFile, deleteFile } from "../controller/customerFileController";
import { upload } from "../middleware/upload";

const router = Router();


router.post("/vehicle/:customerId/:index",authMiddleware,upload.single("file"),uploadVehicleFile);

router.post("/health/:customerId/:index",authMiddleware,upload.single("file"),uploadHealthFile);

router.delete("/:customerId/files", authMiddleware, deleteFile);

export default router;
