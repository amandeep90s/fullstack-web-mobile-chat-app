import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/user.model";
import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Handles the request to get a list of users.
 * It retrieves all users from the database except the authenticated user, and returns their information in the response.
 * @param req
 * @param res
 * @param next
 */
export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const userId = req.userId;

		const users = await User.find({ _id: { $ne: userId } })
			.select("name email avatarUrl")
			.limit(50);

		res.json(users);
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR);
		next(error);
	}
}
