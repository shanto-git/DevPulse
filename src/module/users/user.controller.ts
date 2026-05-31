import { userService } from "./user.service"
import type { Request, Response } from "express";

const createUser = async (req:Request,res:Response)=>{
    try {
        const result = await userService.createUserIntoDB(req.body);
        res.status(201).json({
            success:true,
            message:"User registered successfully",
            data:result,
        })
    } catch (error:any) {
        res.status(400).json({
            message:error.message,
            error: error
        })
    }
}

export const userController = {
    createUser,
}