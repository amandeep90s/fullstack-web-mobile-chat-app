import { MessageSquareIcon } from "lucide-react";

export default function NoConversationsUI() {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-12 text-center">
			<MessageSquareIcon className="mb-3 size-10 text-amber-400" />
			<p className="text-base-content/70 text-sm">No conversations yet</p>
			<p className="text-base-content/60 mt-1 text-xs">Start a new chat to begin</p>
		</div>
	);
}
