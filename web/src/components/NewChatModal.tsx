import { useUsers } from "@/hooks/useUsers";
import { useSocketStore } from "@/lib/socket";
import { UsersIcon } from "lucide-react";
import { useState } from "react";

interface NewChatModalProps {
	isOpen: boolean;
	isPending: boolean;
	onClose: () => void;
	onStartChat: (contactId: string) => void;
}

export default function NewChatModal({ isOpen, isPending, onClose, onStartChat }: NewChatModalProps) {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const { onlineUsers } = useSocketStore();
	const { data: allUsers = [] } = useUsers();
	const isOnline = (id: string) => onlineUsers.has(id);

	const handleStartChat = (participantId: string) => {
		onStartChat(participantId);
		setSearchQuery("");
		onClose();
	};

	const searchResults = allUsers.filter((user) => {
		if (!searchQuery.trim()) return false;

		const query = searchQuery.toLowerCase();

		return user?.name.toLowerCase().includes(query) || user?.email.toLowerCase().includes(query);
	});

	return (
		<dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
			<div className="modal-box">
				<h3 className="mb-4 flex items-center gap-2 font-semibold">
					<UsersIcon className="text-primary size-5" />
					New Chat
				</h3>

				<div className="relative mb-4">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search users by name or email..."
						className="input input-bordered w-full pl-10"
						autoFocus
					/>
				</div>

				<div className="max-h-72 overflow-y-auto">
					{searchResults.map((user) => (
						<button
							key={user._id}
							onClick={() => handleStartChat(user._id)}
							disabled={isPending}
							className="btn btn-ghost w-full justify-start gap-3 normal-case"
						>
							<div className="relative">
								<img src={user.avatarUrl} className="h-10 w-10 rounded-full" />
								{isOnline(user._id) && (
									<span className="bg-success border-base-200 absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2" />
								)}
							</div>
							<div className="text-left">
								<p className="text-sm font-medium">{user.name}</p>
								<p className="text-base-content/70 text-xs">{user.email}</p>
							</div>
						</button>
					))}
				</div>

				<div className="modal-action">
					<form method="dialog">
						<button
							className="btn"
							onClick={() => {
								setSearchQuery("");
								onClose();
							}}
						>
							Close
						</button>
					</form>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop" onClick={onClose}>
				<button>close</button>
			</form>
		</dialog>
	);
}
