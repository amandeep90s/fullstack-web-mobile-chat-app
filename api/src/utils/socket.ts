import { Chat } from "@/models/chat.model";
import { Message } from "@/models/message.model";
import { User } from "@/models/user.model";
import { verifyToken } from "@clerk/express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

// Store online users in a Map where the key is the user ID and the value is the socket ID: userId -> socketId
export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
	const allowedOrigins = [process.env.FRONTEND_URL, process.env.MOBILE_APP_URL].filter(Boolean) as string[];

	const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

	// Verify socket connection - if the user is authenticated, we will store the user id in the socket
	io.use(async (socket, next) => {
		const token = socket.handshake.auth.token; // This is what user will send from the client

		if (!token) return next(new Error("Authentication error: No token provided"));

		try {
			const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
			const clerkId = session.sub;
			const user = await User.findOne({ clerkId });

			if (!user) return next(new Error("Authentication error: User not found"));

			socket.data.userId = user._id.toString(); // Store the user ID in the socket's data for later use

			next();
		} catch (error) {
			next(new Error(error instanceof Error ? error.message : "Authentication error"));
		}
	});

	// this "connection" event name is special and should be written like this
	// it's the event that is triggered when a new client connects to the server
	io.on("connection", (socket) => {
		const userId = socket.data.userId;

		// send list of currently online users to the newly connected client
		socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

		// store user in the onlineUsers map
		onlineUsers.set(userId, socket.id);

		// notify others that this current user is now online
		socket.broadcast.emit("user-online", { userId });

		socket.join(`user:${userId}`); // Join a room specific to this user for private messaging

		socket.on("join-chat", (chatId: string) => {
			socket.join(`chat:${chatId}`); // Join the chat room for group messaging
		});

		socket.on("leave-chat", (chatId: string) => {
			socket.leave(`chat:${chatId}`); // Leave the chat room when the user leaves
		});

		// Handle sending messages
		socket.on("send-message", async (data: { chatId: string; content: string }) => {
			try {
				const { chatId, content } = data;

				if (!chatId || typeof chatId !== "string" || !chatId.match(/^[a-f\d]{24}$/i)) {
					return socket.emit("socket-error", { message: "Invalid chat ID" });
				}

				if (!content || typeof content !== "string" || content.trim().length === 0) {
					return socket.emit("socket-error", { message: "Message content is required" });
				}

				if (content.length > 5000) {
					return socket.emit("socket-error", { message: "Message content is too long" });
				}

				const chat = await Chat.findOne({ _id: chatId, participants: userId });

				if (!chat) {
					return socket.emit("socket-error", { message: "Chat not found or you are not a participant" });
				}

				const message = await Message.create({
					chat: chatId,
					sender: userId,
					content,
				});

				chat.lastMessage = message._id;
				chat.lastMessageAt = new Date();
				await chat.save();

				await message.populate("sender", "name avatarUrl");

				// Emit the new message to all participants in the chat room
				io.to(`chat:${chatId}`).emit("new-message", message);

				// Optionally, you can also emit a notification to users who are not currently in the chat room but are participants
				for (const participantId of chat.participants) {
					io.to(`user:${participantId.toString()}`).emit("new-message", message);
				}
			} catch (error) {
				socket.emit("socket-error", { message: "Failed to send message" });
			}
		});

		// Handle typing indicator
		socket.on("typing", async (data: { chatId: string; isTyping: boolean }) => {
			const typingPayload = {
				userId,
				chatId: data.chatId,
				isTyping: data.isTyping,
			};

			// Emit to chat room (for users inside the chat)
			socket.to(`chat:${data.chatId}`).emit("typing", typingPayload);

			// Also emit to other participant's personal room (for chat list view)
			try {
				const chat = await Chat.findById(data.chatId);
				if (chat) {
					const otherParticipantId = chat.participants.find((p: any) => p.toString() !== userId);
					if (otherParticipantId) {
						socket.to(`user:${otherParticipantId.toString()}`).emit("typing", typingPayload);
					}
				}
			} catch (error) {
				// silently fail - typing indicator is not critical
			}
		});

		// Handle disconnection
		socket.on("disconnect", () => {
			// Remove user from online users map
			onlineUsers.delete(userId);

			// Notify others that this user is now offline
			socket.broadcast.emit("user-offline", { userId });
		});
	});
};
