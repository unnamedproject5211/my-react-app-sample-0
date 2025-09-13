import { Request , Response } from "express";
import User from "../models/User";

export const createUser = async (req:Request , res:Response) => {
    try{
        const {name,email,password} = req.body;

        const existingUser = await User.findOne({ email});
        if(existingUser){
            return res.status(400).json({ message: "user already exists"});
        }

        const newUser = new User({name,email,password});
        await newUser.save();

        res.status(201).json(newUser);
    }catch (error){
        res.status(500).json({message: "error creating user:", error});
    }
};

export const getUsers = async (req:Request , res:Response) => {
    try{
        const users = await User.find();
        res.json(users);
    }catch (error){
        res.status(500).json({message: "error fetching users", error});
    }
};