import { formatTime } from "@/lib/utils";
import type { IMessage, IUser } from "@/types";

interface MessageBubbleProps {
	message: IMessage;
	currentUser: IUser;
}

export default function MessageBubble({ message, currentUser }: MessageBubbleProps) {
	const isMe = message.sender?._id === currentUser?._id;

	return (
		<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-md rounded-2xl px-4 py-2.5 ${
					isMe ? "text-primary-content bg-linear-to-r from-amber-500 to-orange-500" : "bg-base-300/40 text-base-content"
				}`}
			>
				<p className="text-sm">{message.content}</p>
				<p className={`mt-1 text-xs ${isMe ? "text-primary-content/80" : "text-base-content/70"}`}>
					{formatTime(message.createdAt)}
				</p>
			</div>
		</div>
	);
}
