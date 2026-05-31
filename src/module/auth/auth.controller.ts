import type { Request, Response } from "express";
import { authService } from "./auth.service";


const loginUser = async(req:Request,res:Response)=>{
    try {
        const result = await authService.loginUserIntoDb(req.body);
        
        res.status(200).json({
            success:true,
            message:"Login successful",
            data:result,
        })
    } catch (error:any) {
        res.status(401).json({
            success:false,
            message: error.message,
        })
    }
}

export const authController ={
    loginUser
}