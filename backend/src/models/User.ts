import mongoose,{ Document , Schema} from "mongoose";

export interface IUser extends Document { 
    name : string; 
    email: string;
    password:string;
    createdAt: Date;
}

const userScheme : Schema = new Schema({
    name: { type: String, required:true },
    email: { type: String, required:true, unique:true },
    password: {type: String, required:true },
    createdAt: {type:Date, default:Date.now }
})

export default mongoose.model<IUser>("User", userScheme);