import { MessageSquareIcon } from "lucide-react";

export default function NoChatSelectedUI() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
			<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-amber-500/20 to-orange-500/20">
				<MessageSquareIcon className="h-10 w-10 text-amber-400" />
			</div>
			<h2 className="mb-2 text-2xl font-bold">Welcome to Chat App</h2>
			<p className="text-base-content/70 max-w-sm">
				Select a conversation from the sidebar or start a new chat to begin messaging
			</p>
		</div>
	);
}
