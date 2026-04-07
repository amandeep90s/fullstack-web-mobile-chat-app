import axiosInstance from "@/lib/axios";
import type { IChat } from "@/types";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to fetch the list of chats for the authenticated user.
 * @returns An object containing the query state and data for the chats.
 */
export const useChats = () => {
	const { getToken } = useAuth();

	return useQuery<IChat[]>({
		queryKey: ["chats"],
		queryFn: async () => {
			const token = await getToken();

			const response = await axiosInstance.get<IChat[]>("/chats", {
				headers: { Authorization: `Bearer ${token}` },
			});

			return response.data;
		},
	});
};

/**
 * Custom hook to create a new chat with a specified participant or fetch an existing one.
 * @returns An object containing the mutation function and state for creating or fetching a chat.
 */
export const useGetOrCreateChat = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation<IChat, Error, string>({
		mutationFn: async (participantId: string) => {
			const token = await getToken();
			const response = await axiosInstance.post<IChat>(
				`/chats/with/${participantId}`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			return response.data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
	});
};
