import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { IIssue } from "./issue.interface";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createIssue = async (req: Request, res: Response) => {
  const reporter_id = (req as any).user.id;
  const payload: IIssue = {
    ...req.body,
    reporter_id,
  };
  const result = await issueService.createIssueIntoDB(payload);
  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: "Issue created successfully",
    data: result,
  });
};

const getAllIssue = async (req: Request, res: Response) => {
  const queryParams = {
    sort: req.query.sort as string,
    type: req.query.type as string,
    status: req.query.status as string,
  };
  const result = await issueService.getAllIssueFromDB(queryParams);
  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Issues retrieved successfully",
    data: result,
  });
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await issueService.singleIssueFromDB(id as string);

  if (!result) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Issue not found",
    });
  }
  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Issue retrieved successfully",
    data: result,
  });
};

const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const result = await issueService.updateIssueFromDB(
    req.body,
    id as string,
    user as any,
  );
  
  // console.log("Query finished", result);
  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Issue updated successfully",
    data: result,
  });
});

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = (req as any).user.role;
  await issueService.deleteIssueFromDB(id as string, userRole);
  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Issue deleted successfully",
    data: null,
  });
};

export const issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
