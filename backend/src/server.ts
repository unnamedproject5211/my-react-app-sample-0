import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import customerRoutes from "./routes/customerRoutes";

connectDB();

const exp = express();
const PORT = process.env.PORT || 5000;

//middleware
exp.use(cors());
exp.use(express.json());

//routes
exp.use("/api/users", userRoutes);
exp.use("/api/customers", customerRoutes);

exp.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});