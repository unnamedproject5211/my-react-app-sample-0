import mongoose,{ Document , Schema} from "mongoose";

export interface IUser extends Document { 
    name : string; 
    email: string;
    password:string;
    createdAt: Date;
    isVerified: boolean;
    otpHash?: string;
    otpExpires?: Date;
    lastOtpSentAt?: Date;
}

const userScheme : Schema = new Schema({
    name: { type: String, required:true },
    email: { type: String, required:true, unique:true },
    password: {type: String, required:true },
    createdAt: {type:Date, default:Date.now },
    // New fields for OTP verification
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String },
    otpExpires: { type: Date },
    lastOtpSentAt: { type: Date }
})

export default mongoose.model<IUser>("User", userScheme);