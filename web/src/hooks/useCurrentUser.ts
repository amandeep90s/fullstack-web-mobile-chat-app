import axiosInstance from "@/lib/axios";
import type { IUser } from "@/types";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch the current authenticated user's information.
 * @returns An object containing the query state and data for the current user.
 */
export const useCurrentUser = () => {
	const { getToken } = useAuth();

	return useQuery<IUser>({
		queryKey: ["currentUser"],
		queryFn: async () => {
			const token = await getToken();

			const response = await axiosInstance.get<IUser>("/auth/me", {
				headers: { Authorization: `Bearer ${token}` },
			});

			return response.data;
		},
	});
};
