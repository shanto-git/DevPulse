import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong!";
  const errors = err.errors || err.stack || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors,
  });
};

export default errorHandler;