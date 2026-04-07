// ─── Base ────────────────────────────────────────────────────────────────────

export interface IUser {
	_id: string;
	clerkId: string;
	name: string;
	email: string;
	avatarUrl: string;
	createdAt: string;
	updatedAt: string;
}

// ─── Messages ────────────────────────────────────────────────────────────────

/** Sender is populated with a subset of User fields */
export interface IMessageSender {
	_id: string;
	name: string;
	email: string;
	avatarUrl: string;
}

/** Returned by GET /api/messages/chat/:chatId */
export interface IMessage {
	_id: string;
	chat: string;
	sender: IMessageSender;
	content: string;
	createdAt: string;
	updatedAt: string;
}

// ─── Chats ───────────────────────────────────────────────────────────────────

/** Participant is populated with a subset of User fields */
export interface IChatParticipant {
	_id: string;
	name: string;
	email: string;
	avatarUrl: string;
}

/**
 * Returned by:
 *  - GET  /api/chats
 *  - POST /api/chats/with/:participantId
 */
export interface IChat {
	_id: string;
	participant: IChatParticipant | null;
	lastMessage: IMessage | null;
	lastMessageAt: string | null;
	createdAt: string;
}

// ─── Socket events ───────────────────────────────────────────────────────────

export interface ITypingPayload {
	userId: string;
	chatId: string;
	isTyping: boolean;
}

export interface IOnlineUsersPayload {
	userIds: string[];
}

export interface IUserOnlinePayload {
	userId: string;
}

export interface IUserOfflinePayload {
	userId: string;
}

export interface ISocketErrorPayload {
	message: string;
}

// ─── API error ───────────────────────────────────────────────────────────────

export interface IApiError {
	message: string;
	stack?: string;
}
