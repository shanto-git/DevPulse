import type { Request, Response } from "express";
import { authService } from "./auth.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";


const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUserIntoDb(req.body);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const authController ={
    loginUser
}