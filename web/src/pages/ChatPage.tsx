import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatListItem from "@/components/ChatListItem";
import MessageBubble from "@/components/MessageBubble";
import NewChatModal from "@/components/NewChatModal";
import NoChatSelectedUI from "@/components/NoChatSelectedUI";
import NoConversationsUI from "@/components/NoConversationsUI";
import NoMessagesUI from "@/components/NoMessagesUI";
import { useChats, useGetOrCreateChat } from "@/hooks/useChats";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMessages } from "@/hooks/useMessages";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { useSocketStore } from "@/lib/socket";
import type { IUser } from "@/types";
import { UserButton } from "@clerk/react";
import { PlusIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";

export default function ChatPage() {
	const { data: currentUser } = useCurrentUser();

	const [searchParams, setSearchParams] = useSearchParams();
	const activeChatId = searchParams.get("chat");

	const [messageInput, setMessageInput] = useState("");
	const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { socket, setTyping, sendMessage } = useSocketStore();

	useSocketConnection();

	const { data: chats = [], isLoading: chatsLoading } = useChats();
	const { data: messages = [], isLoading: messagesLoading } = useMessages(activeChatId ?? "");
	const startChatMutation = useGetOrCreateChat();

	// scroll to bottom when chat or messages changes
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [activeChatId, messages]);

	const handleStartChat = (participantId: string) => {
		startChatMutation.mutate(participantId, {
			onSuccess: (chat) => setSearchParams({ chat: chat._id }),
		});
	};

	const handleSend = () => {
		if (!messageInput.trim() || !activeChatId || !socket || !currentUser) return;

		const text = messageInput.trim();
		sendMessage(activeChatId, text, currentUser);
		setMessageInput("");
		setTyping(activeChatId, false);
	};

	const handleTyping = (value: string) => {
		setMessageInput(value);
		if (!activeChatId) return;

		setTyping(activeChatId, true);
		clearTimeout(typingTimeoutRef.current ?? undefined);
		typingTimeoutRef.current = setTimeout(() => {
			setTyping(activeChatId, false);
		}, 2000);
	};

	const activeChat = chats.find((c) => c._id === activeChatId);

	return (
		<div className="bg-base-100 text-base-content flex h-screen">
			{/* Sidebar */}
			<div className="border-base-300 bg-base-200 flex w-80 flex-col border-r">
				{/* Header */}
				<div className="border-base-300 border-b p-4">
					<div className="mb-4 flex items-center justify-between">
						<Link to="/chat" className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-orange-500">
								<SparklesIcon className="text-primary-content h-4 w-4" />
							</div>
							<span className="font-bold">Chat App</span>
						</Link>

						<UserButton />
					</div>

					<button
						onClick={() => setIsNewChatModalOpen(true)}
						className="btn btn-primary btn-block gap-2 rounded-xl border-none bg-linear-to-r from-amber-500 to-orange-500"
					>
						<PlusIcon className="size-4" /> New Chat
					</button>
				</div>

				{/* Chat List */}
				<div className="flex-1 overflow-y-auto">
					{chatsLoading && (
						<div className="flex items-center justify-center py-8">
							<span className="loading loading-spinner loading-sm text-amber-400"></span>
						</div>
					)}

					{chats.length === 0 && !chatsLoading && <NoConversationsUI />}

					<div className="flex flex-col gap-1">
						{chats.map((chat) => (
							<ChatListItem
								key={chat._id}
								chat={chat}
								isActive={activeChatId === chat._id}
								onClick={() => setSearchParams({ chat: chat._id })}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex flex-1 flex-col">
				{!activeChatId ? (
					<NoChatSelectedUI />
				) : (
					<>
						{activeChat?.participant && (
							<ChatHeader chatId={activeChatId} participant={activeChat.participant as IUser} />
						)}

						<div className="flex-1 overflow-y-auto p-4">
							{messagesLoading ? (
								<div className="flex h-full items-center justify-center">
									<span className="loading loading-spinner loading-sm text-amber-400"></span>
								</div>
							) : messages.length === 0 ? (
								<NoMessagesUI />
							) : (
								<div className="flex flex-col gap-3">
									{currentUser &&
										messages.map((message) => (
											<MessageBubble key={message._id} message={message} currentUser={currentUser} />
										))}
									<div ref={messagesEndRef} />
								</div>
							)}
						</div>

						<ChatInput value={messageInput} onChange={handleTyping} onSubmit={handleSend} disabled={!socket} />
					</>
				)}
			</div>

			<NewChatModal
				isOpen={isNewChatModalOpen}
				isPending={startChatMutation.isPending}
				onClose={() => setIsNewChatModalOpen(false)}
				onStartChat={handleStartChat}
			/>
		</div>
	);
}
