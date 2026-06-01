import { StatusCodes } from "http-status-codes";
import { userService } from "./user.service"
import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";

const createUser = async (req:Request,res:Response)=>{
    const result = await userService.createUserIntoDB(req.body);
    sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: "User registered successfully",
    data: result,
  });
}

export const userController = {
    createUser,
}