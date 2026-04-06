import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
	console.log("Errors:", err.message);

	const statusCode = res.statusCode !== StatusCodes.OK ? res.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;

	res.status(statusCode).json({
		message: err.message || "Internal Server Error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};
