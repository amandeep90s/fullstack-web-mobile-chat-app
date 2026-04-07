import { LoaderIcon } from "lucide-react";

export default function PageLoader() {
	return (
		<div className="flex items-center justify-center h-screen bg-black">
			<LoaderIcon className="size-6 animate-spin text-orange-500" />
		</div>
	);
}
