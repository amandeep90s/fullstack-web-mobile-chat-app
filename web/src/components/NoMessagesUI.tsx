import { MessageSquareIcon } from "lucide-react";

export default function NoMessagesUI() {
	return (
		<div className="flex h-full flex-col items-center justify-center text-center">
			<div className="bg-base-300/40 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
				<MessageSquareIcon className="text-base-content/20 h-8 w-8" />
			</div>
			<p className="text-base-content/70">No messages yet</p>
			<p className="text-base-content/60 mt-1 text-sm">Send a message to start the conversation</p>
		</div>
	);
}
