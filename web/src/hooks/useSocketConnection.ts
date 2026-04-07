import { useSocketStore } from "@/lib/socket";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Custom hook to manage WebSocket connection and chat room membership based on the authenticated user's state and active chat.
 * @param activeChatId The ID of the currently active chat, used to join or leave chat rooms as needed.
 * @returns An object containing the socket connection state and functions to manage the connection and chat room membership.
 */
export const useSocketConnection = (activeChatId: string): void => {
	const { getToken, isSignedIn } = useAuth();
	const queryClient = useQueryClient();

	const { socket, connect, disconnect, joinChat, leaveChat } = useSocketStore();

	// Connect socket on mount and disconnect on unmount or when the user signs out
	useEffect(() => {
		if (isSignedIn) {
			getToken().then((token) => {
				if (token) connect(token, queryClient);
			});
		} else {
			disconnect();
		}
		return () => {
			disconnect();
		};
	}, [connect, disconnect, getToken, isSignedIn, queryClient]);

	// Join/Leave chat rooms - if you have a chatid in the url this will run
	useEffect(() => {
		if (activeChatId && socket) {
			joinChat(activeChatId);
			return () => leaveChat(activeChatId);
		}
	}, [activeChatId, socket, joinChat, leaveChat]);
};
