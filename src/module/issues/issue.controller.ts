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

export const issueController = {
  createIssue,
  getAllIssue
};
