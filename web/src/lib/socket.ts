import type {
	IChat,
	IMessage,
	IMessageSender,
	IOnlineUsersPayload,
	ISocketErrorPayload,
	ISocketState,
	ISocketStore,
	ITypingPayload,
	IUserOfflinePayload,
	IUserOnlinePayload,
} from "@/types";
import type { QueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { create } from "zustand";

const SOCKET_URL = import.meta.env.VITE_API_URL;

const initialState: ISocketState = {
	socket: null,
	onlineUsers: new Set(),
	typingUsers: new Map(),
	queryClient: null,
};

export const useSocketStore = create<ISocketStore>((set, get) => ({
	...initialState,

	connect: (token: string, queryClient: QueryClient) => {
		const existingSocket = get().socket;

		// If there's already a connected socket or if the queryClient is not provided, do nothing
		if (existingSocket?.connected || !queryClient) return;

		const socket = io(SOCKET_URL, { auth: { token } });

		socket.on("connect", () => {
			console.log("Socket connected:", socket.id);
		});

		socket.on("connect_error", (error: Error) => {
			console.error("Socket connection error:", error.message);
		});

		socket.on("socket-error", (error: ISocketErrorPayload) => {
			console.error("Socket error:", error.message);
		});

		socket.on("online-users", ({ userIds }: IOnlineUsersPayload) => {
			set({ onlineUsers: new Set(userIds) });
		});

		socket.on("user-online", ({ userId }: IUserOnlinePayload) => {
			set((state) => ({
				onlineUsers: new Set([...state.onlineUsers, userId]),
			}));
		});

		socket.on("user-offline", ({ userId }: IUserOfflinePayload) => {
			set((state) => {
				const onlineUsers = new Set(state.onlineUsers);
				onlineUsers.delete(userId);
				return { onlineUsers };
			});
		});

		socket.on("typing", ({ userId, chatId, isTyping }: ITypingPayload) => {
			set((state) => {
				const typingUsers = new Map(state.typingUsers);
				if (isTyping) typingUsers.set(chatId, userId);
				else typingUsers.delete(chatId);
				return { typingUsers };
			});
		});

		socket.on("new-message", (message: IMessage) => {
			// Update messages in current chat, replacing optimistic messages
			queryClient.setQueryData<IMessage[]>(["messages", message.chat], (old) => {
				if (!old) return [message];
				// Remove any optimistic messages (temp IDs) and add the real one
				const filtered = old.filter((m) => !m._id.startsWith("temp-"));
				const exists = filtered.some((m) => m._id === message._id);
				return exists ? filtered : [...filtered, message];
			});

			// Update chat's lastMessage directly for instant UI update
			queryClient.setQueryData<IChat[]>(["chats"], (oldChats) => {
				return oldChats?.map((chat) => {
					if (chat._id === message.chat) {
						return { ...chat, lastMessage: message, lastMessageAt: message.createdAt };
					}
					return chat;
				});
			});

			// Clear typing indicator when message received
			set((state) => {
				const typingUsers = new Map(state.typingUsers);
				typingUsers.delete(message.chat);
				return { typingUsers };
			});
		});

		set({ socket, queryClient });
	},

	disconnect: () => {
		const socket = get().socket;

		if (socket) {
			socket.disconnect();
			set(initialState);
		}
	},

	joinChat: (chatId: string) => {
		get().socket?.emit("join-chat", chatId);
	},

	leaveChat: (chatId: string) => {
		get().socket?.emit("leave-chat", chatId);
	},

	sendMessage: (chatId: string, content: string, currentUser: IMessageSender) => {
		const { socket, queryClient } = get();
		if (!socket?.connected || !queryClient) return;

		// Build optimistic message using IMessageSender fields (name, email, avatarUrl)
		const tempId = `temp-${Date.now()}`;
		const optimisticMessage: IMessage = {
			_id: tempId,
			chat: chatId,
			sender: {
				_id: currentUser._id,
				name: currentUser.name,
				email: currentUser.email,
				avatarUrl: currentUser.avatarUrl,
			},
			content,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// add optimistic message immediately
		queryClient.setQueryData<IMessage[]>(["messages", chatId], (old) => {
			if (!old) return [optimisticMessage];
			return [...old, optimisticMessage];
		});

		// emit to server
		socket.emit("send-message", { chatId, content });

		// handle errors - remove optimistic message if send fails
		socket.once("socket-error", () => {
			queryClient.setQueryData<IMessage[]>(["messages", chatId], (old) => {
				if (!old) return [];
				return old.filter((m) => m._id !== tempId);
			});
		});
	},

	setTyping: (chatId: string, isTyping: boolean) => {
		get().socket?.emit("typing", { chatId, isTyping });
	},
}));
