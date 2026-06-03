

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  database_url: process.env.DATABASE_URL,
  port: process.env.PORT,
  secret: process.env.SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.database_url
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            email VARCHAR UNIQUE NOT NULL,
            password VARCHAR NOT NULL,
            role VARCHAR DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')) NOT NULL,
            
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW())
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL CHECK (length(description) >= 20),
            type VARCHAR(20) NOT NULL CHECK (
            type IN ('bug', 'feature_request')),
            status VARCHAR(20) NOT NULL DEFAULT 'open'
            CHECK (status IN ('open','in_progress', 'resolved')),
            reporter_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW())
            `);
  } catch (error) {
    console.log(error);
  }
};

// src/app.ts
import express from "express";

// src/module/auth/auth.route.ts
import { Router } from "express";

// src/module/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var loginUserIntoDb = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credential");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  loginUserIntoDb
};

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/utils/sendResponse.ts
var sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/module/auth/auth.controller.ts
import { StatusCodes } from "http-status-codes";
var loginUser = catchAsync_default(async (req, res) => {
  const result = await authService.loginUserIntoDb(req.body);
  sendResponse_default(res, StatusCodes.OK, {
    success: true,
    message: "Login successful",
    data: result
  });
});
var authController = {
  loginUser
};

// src/module/users/user.controller.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";

// src/module/users/user.service.ts
import bcrypt2 from "bcrypt";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const bPassword = await bcrypt2.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING *`,
    [name, email, bPassword, role]
  );
  return result.rows[0];
};
var userService = {
  createUserIntoDB
};

// src/module/users/user.controller.ts
var createUser = async (req, res) => {
  const result = await userService.createUserIntoDB(req.body);
  sendResponse_default(res, StatusCodes2.CREATED, {
    success: true,
    message: "User registered successfully",
    data: result
  });
};
var userController = {
  createUser
};

// src/module/auth/auth.route.ts
var router = Router();
router.post("/signup", userController.createUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/module/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/module/issues/issue.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *
        `,
    [title, description, type, reporter_id]
  );
  return result.rows[0];
};
var getAllIssueFromDB = async (queryParams) => {
  const { sort, type, status } = queryParams;
  let queryText = `SELECT * FROM issues WHERE 1=1`;
  const queryParamsArray = [];
  let paramIndex = 1;
  if (type) {
    queryText += ` AND type = $${paramIndex}`;
    queryParamsArray.push(type);
    paramIndex++;
  }
  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    queryParamsArray.push(status);
    paramIndex++;
  }
  if (sort === "oldest") {
    queryText += ` ORDER BY created_at ASC`;
  } else {
    queryText += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(queryText, queryParamsArray);
  const issues = result.rows;
  const reporterId = [...new Set(issues.map((issue) => issue.reporter_id))];
  if (reporterId.length === 0) {
    return [];
  }
  const getUser = await pool.query(
    `
            SELECT * FROM users WHERE id = any($1)
            `,
    [reporterId]
  );
  const usersMap = /* @__PURE__ */ new Map();
  getUser.rows.forEach((user) => usersMap.set(user.id, user));
  const formattedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: usersMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return formattedIssues;
};
var singleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id = $1
      `,
    [id]
  );
  const issue = result.rows[0];
  if (!issue) {
    return null;
  }
  const userResult = await pool.query(
    `
      SELECT * FROM issues WHERE id = $1
      `,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssueFromDB = async (payload, id, user) => {
  console.log("Service started");
  const { title, description, type, status } = payload;
  const currentIssue = await pool.query(
    `
    SELECT * FROM issues WHERE id = $1
    `,
    [id]
  );
  const issue = currentIssue.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("Forbidden: You can only update your own issues");
    }
    if (issue.status !== "open") {
      throw new Error("Forbidden: Your update is in_progress");
    }
  }
  const result = await pool.query(
    `
    UPDATE issues SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    type = COALESCE($3, type),
    status = COALESCE($4, 'in_progress'), updated_at=NOW() WHERE id = $5 RETURNING *
    `,
    [title, description, type, status, id]
  );
  console.log("DB result:", result.rows);
  return result.rows[0];
};
var deleteIssueFromDB = async (id, role) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id = $1
    `,
    [id]
  );
  return result.rows[0];
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  singleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/module/issues/issue.controller.ts
import { StatusCodes as StatusCodes3 } from "http-status-codes";
var createIssue = async (req, res) => {
  const reporter_id = req.user.id;
  const payload = {
    ...req.body,
    reporter_id
  };
  const result = await issueService.createIssueIntoDB(payload);
  sendResponse_default(res, StatusCodes3.CREATED, {
    success: true,
    message: "Issue created successfully",
    data: result
  });
};
var getAllIssue = async (req, res) => {
  const queryParams = {
    sort: req.query.sort,
    type: req.query.type,
    status: req.query.status
  };
  const result = await issueService.getAllIssueFromDB(queryParams);
  sendResponse_default(res, StatusCodes3.OK, {
    success: true,
    message: "Issues retrieved successfully",
    data: result
  });
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  const result = await issueService.singleIssueFromDB(id);
  if (!result) {
    return res.status(StatusCodes3.NOT_FOUND).json({
      success: false,
      message: "Issue not found"
    });
  }
  sendResponse_default(res, StatusCodes3.OK, {
    success: true,
    message: "Issue retrieved successfully",
    data: result
  });
};
var updateIssue = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await issueService.updateIssueFromDB(
    req.body,
    id,
    user
  );
  sendResponse_default(res, StatusCodes3.OK, {
    success: true,
    message: "Issue updated successfully",
    data: result
  });
});
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;
  await issueService.deleteIssueFromDB(id, userRole);
  sendResponse_default(res, StatusCodes3.OK, {
    success: true,
    message: "Issue deleted successfully",
    data: null
  });
};
var issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access: Token is missing"
        });
      }
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access. Token is required."
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `
                SELECT * FROM users WHERE email = $1
                `,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found!!"
        });
      }
      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to perform this action"
        });
      }
      req.user = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};
var auth_default = auth;

// src/module/issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issueController.createIssue);
router2.get("/", issueController.getAllIssue);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(), issueController.updateIssue);
router2.delete("/:id", auth_default("maintainer"), issueController.deleteIssue);
var issueRoute = router2;

// src/app.ts
import cors from "cors";

// src/middleware/errorHandler.ts
import { StatusCodes as StatusCodes4 } from "http-status-codes";
var errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes4.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong!";
  const errors = err.errors || err.stack || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
var errorHandler_default = errorHandler;

// src/app.ts
var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse Server is running smoothly",
    authorize: "Masuduzzaman"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Requested API Endpoint Not Found",
    errors: `Cannot ${req.method} ${req.url}`
  });
});
app.use(errorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  try {
    await initDB();
    console.log("Database initialized successfully!");
    app_default.listen(config_default.port, () => {
      console.log(`DevPulse Server is running on port ${config_default.port}`);
    });
  } catch (error) {
    console.error("Server startup failed due to database error:", error);
    process.exit(1);
  }
};
main();
//# sourceMappingURL=server.js.map