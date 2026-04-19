import { SendIcon } from "lucide-react";

interface ChatInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="border-base-300 border-t p-4"
		>
			<div className="flex items-center gap-3">
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Type a message..."
					className="input input-bordered bg-base-300/40 border-base-300 placeholder:text-base-content/60 flex-1 rounded-xl"
				/>

				<button
					type="submit"
					className="btn disabled:btn-disabled rounded-xl border-none bg-linear-to-r from-amber-500 to-orange-500"
					disabled={disabled}
				>
					<SendIcon className="size-5" />
				</button>
			</div>
		</form>
	);
}
