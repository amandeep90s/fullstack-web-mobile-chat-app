import { useSocketStore } from "@/lib/socket";
import type { IUser } from "@/types";

interface ChatHeaderProps {
	chatId: string;
	participant: IUser;
}

export default function ChatHeader({ chatId, participant: participant }: ChatHeaderProps) {
	const { onlineUsers, typingUsers } = useSocketStore();
	const isOnline = onlineUsers.has(participant._id);
	const typingUserId = typingUsers.get(chatId);
	const isTyping = typingUserId && typingUserId === participant._id;

	return (
		<div className="border-base-300 bg-base-200/80 flex h-16 items-center gap-4 border-b px-6">
			<div className="relative">
				<img
					src={participant.avatarUrl}
					alt={participant.name}
					className="bg-base-200/80 h-10 w-10 gap-4 rounded-full"
				/>
				{isOnline && (
					<span className="bg-success border-base-200 absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2" />
				)}
			</div>

			<div>
				<h2 className="font-semibold">{participant?.name}</h2>
				<p className="text-base-content/70 text-xs">{isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}</p>
			</div>
		</div>
	);
}
