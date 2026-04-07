import { LoaderIcon } from "lucide-react";

export default function PageLoader() {
	return (
		<div className="flex h-screen items-center justify-center bg-black">
			<LoaderIcon className="text-primary size-6 animate-spin" />
		</div>
	);
}
