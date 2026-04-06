import type { AuthRequest } from "@/middleware/auth";
import { Chat } from "@/models/chat.model";
import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

/**
 * Get all chats for the authenticated user, including the last message and the other participant's info.
 * @param req
 * @param res
 * @param next
 */
export async function getChats(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const userId = req.userId;

		const chats = await Chat.find({ participants: userId })
			.populate("participants", "name email avatarUrl")
			.populate("lastMessage")
			.sort({ lastMessageAt: -1 });

		const formattedChats = chats.map((chat) => {
			const otherParticipant = chat.participants.find((p) => p._id.toString() !== userId);

			return {
				_id: chat._id,
				participant: otherParticipant ?? null,
				lastMessage: chat.lastMessage,
				lastMessageAt: chat.lastMessageAt,
				createdAt: chat.createdAt,
			};
		});

		res.json(formattedChats);
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR);
		next(error);
	}
}

/**
 * Get or create a chat between the authenticated user and another participant.
 * If a chat already exists, return it; otherwise, create a new one.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function getOrCreateChat(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const userId = req.userId;
		const { participantId } = req.params;

		if (!participantId) {
			res.status(400).json({ message: "Participant ID is required" });
			return;
		}

		if (!Types.ObjectId.isValid(participantId.toString())) {
			return res.status(400).json({ message: "Invalid participant ID" });
		}

		if (userId === participantId.toString()) {
			res.status(400).json({ message: "Cannot create chat with yourself" });
			return;
		}

		// check if chat already exists
		let chat = await Chat.findOne({
			participants: { $all: [userId, participantId] },
		})
			.populate("participants", "name email avatarUrl")
			.populate("lastMessage");

		if (!chat) {
			const newChat = new Chat({ participants: [userId, participantId] });
			await newChat.save();
			chat = await newChat.populate("participants", "name email avatarUrl");
		}

		const otherParticipant = chat.participants.find((p: any) => p._id.toString() !== userId);

		res.json({
			_id: chat._id,
			participant: otherParticipant ?? null,
			lastMessage: chat.lastMessage,
			lastMessageAt: chat.lastMessageAt,
			createdAt: chat.createdAt,
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR);
		next(error);
	}
}
