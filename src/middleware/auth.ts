import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access: Token is missing",
        });
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access. Token is required.",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      const userData = await pool.query(
        `
                SELECT * FROM users WHERE email = $1
                `,
        [decoded.email],
      );

      const user = userData.rows[0];

      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found!!",
        });
      }

      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You do not have permission to perform this action",
        });
      }

      (req as any).user = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};

export default auth;
