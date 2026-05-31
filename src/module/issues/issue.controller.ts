import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { IIssue } from "./issue.interface";

const createIssue = async (req: Request, res: Response) => {
  const reporter_id = (req as any).user.id;
  const payload: IIssue = {
    ...req.body,
    reporter_id,
  };
  try {
    const result = await issueService.createIssueIntoDB(payload);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllIssue = async (req:Request, res:Response)=>{
    try {
        const result = await issueService.getAllIssueFromDB();

        res.status(200).json({
            success:true,
            message:"Issues retrived successfully",
            data: result
        })
    } catch (error:any) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

const getSingleIssue = async (req:Request,res:Response)=>{
  const {id} = req.params
  try {
    const result = await issueService.singleIssueFromDB(id as string);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "user not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue retrived successfully",
      data: result,
    });
  } catch (error:any) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}
export const issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue
};
