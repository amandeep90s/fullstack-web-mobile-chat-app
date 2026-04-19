/**
 * Formats a date into a human-readable string based on how much time has passed since that date.
 * @param date - The date to format
 * @returns A formatted string representing the time difference (e.g., "now", "5m ago", "3:45 PM", "Mon", "Jan 1")
 */
export function formatTime(dateString: string): string {
	const date = new Date(dateString);

	if (isNaN(date.getTime())) return "";

	const day = new Date(date);
	const now = new Date();
	const difference = now.getTime() - day.getTime();

	let response = day.toLocaleDateString([], { month: "short", day: "numeric" });

	if (difference < 60000) {
		response = "now";
	} else if (difference < 3600000) {
		response = `${Math.floor(difference / 60000)}m ago`;
	} else if (difference < 86400000) {
		response = day.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	} else if (difference < 604800000) {
		response = day.toLocaleDateString([], { weekday: "short" });
	}

	return response;
}
