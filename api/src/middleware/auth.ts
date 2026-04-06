import { User } from "@/models/user.model";
import { getAuth, requireAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type AuthRequest = Request & {
	userId?: string;
};

export const protectRoute = [
	requireAuth(),
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const { userId: clerkId } = getAuth(req);

			const user = await User.findOne({ clerkId });
			if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

			req.userId = user._id.toString();

			next();
		} catch (error) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR);
			next(error);
		}
	},
];
