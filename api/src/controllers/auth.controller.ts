import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/user.model";
import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Handles the request to get the authenticated user's information.
 * It retrieves the user ID from the request (set by the authentication middleware),
 * fetches the user from the database, and returns the user's information in the response.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const userId = req.userId;

		const user = await User.findById(userId);

		if (!user) {
			res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
			return;
		}

		res.status(StatusCodes.OK).json(user);
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR);
		next(error);
	}
}

/**
 * Handles the authentication callback from Clerk.
 * It checks if the user exists in the database, and if not, creates a new user based on the information from Clerk.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function authCallback(req: Request, res: Response, next: NextFunction) {
	try {
		const { userId: clerkId } = getAuth(req);

		if (!clerkId) {
			res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
			return;
		}

		let user = await User.findOne({ clerkId });

		if (!user) {
			// Get user details from Clerk and create a new user in the database
			const clerkUser = await clerkClient.users.getUser(clerkId);

			user = await User.create({
				clerkId,
				name: clerkUser.firstName
					? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
					: clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0],
				email: clerkUser.emailAddresses[0]?.emailAddress,
				avatarUrl: clerkUser.imageUrl,
			});
		}

		res.json(user);
	} catch (error) {}
}
