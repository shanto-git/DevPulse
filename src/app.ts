import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { authRoute } from "./module/auth/auth.route";
import { issueRoute } from "./module/issues/issue.route";
import cors from "cors"
import errorHandler from "./middleware/errorHandler";

const app: Application = express();


app.use(cors({origin:true, credentials:true}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Server is running smoothly",
    authorize: "Masuduzzaman",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use((req:Request,res:Response, next: NextFunction)=>{
  res.status(404).json({
    success: false,
    message: "Requested API Endpoint Not Found",
    errors: `Cannot ${req.method} ${req.url}`
  });
})

app.use(errorHandler);

export default app;
