import express from "express";
import { createUser , getUsers } from "../controller/usercontroller";

const router = express.Router();

router.post("/add", createUser);
router.get("/",getUsers);

export default router;