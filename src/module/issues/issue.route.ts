import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth(), issueController.createIssue);
router.get("/", issueController.getAllIssue)
router.get("/:id", issueController.getSingleIssue)
export const issueRoute = router;
