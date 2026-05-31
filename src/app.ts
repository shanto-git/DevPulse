import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRouter } from "./module/users/user.route";
import { authRoute } from "./module/auth/auth.route";
import { issueRoute } from "./module/issues/issue.route";

const app: Application = express();

app.use(express.json());
// app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Server",
    authorize: "Masuduzzaman",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

export default app;
