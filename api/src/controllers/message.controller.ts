import type { AuthRequest } from "@/middleware/auth";
import { Chat } from "@/models/chat.model";
import { Message } from "@/models/message.model";
import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Handles the request to get messages for a specific chat.
 * It checks if the chat exists and if the authenticated user is a participant of the chat.
 * If so, it retrieves the messages for that chat, populates the sender information, and returns the messages in the response.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const userId = req.userId;
		const { chatId } = req.params;

		const chat = await Chat.findOne({ _id: chatId, participants: userId });

		if (!chat) {
			res.status(StatusCodes.NOT_FOUND).json({ message: "Chat not found" });
			return;
		}

		const messages = await Message.find({ chat: chatId })
			.populate("sender", "name email avatarUrl")
			.sort({ createdAt: 1 });

		res.status(StatusCodes.OK).json(messages);
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR);
		next(error);
	}
}
