import ChatListItem from "@/components/ChatListItem";
import NoConversationsUI from "@/components/NoConversationsUI";
import { useChats } from "@/hooks/useChats";
import { UserButton } from "@clerk/react";
import { PlusIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function ChatPage() {
	const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);

	const { data: chats = [], isLoading: chatsLoading } = useChats();

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
							<ChatListItem key={chat._id} />
						))}
					</div>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex flex-1 flex-col"></div>
		</div>
	);
}
