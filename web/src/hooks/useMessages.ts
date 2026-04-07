import axiosInstance from "@/lib/axios";
import type { IMessage } from "@/types";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch messages for a specific chat.
 * @param chatId The ID of the chat for which to fetch messages.
 * @returns An object containing the query state and data for the messages of the specified chat.
 */
export const useMessages = (chatId: string) => {
	const { getToken } = useAuth();

	return useQuery<IMessage[]>({
		queryKey: ["messages", chatId],
		queryFn: async () => {
			const token = await getToken();

			const response = await axiosInstance.get<IMessage[]>(`/messages/chat/${chatId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			return response.data;
		},
		enabled: !!chatId,
	});
};
