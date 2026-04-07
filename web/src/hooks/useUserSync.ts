import axiosInstance from "@/lib/axios";
import type { IUser } from "@/types";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to synchronize the authenticated user's information with the backend and fetch the list of users.
 * @returns An object containing the query state and data for the users, as well as the synchronization state of the user information.
 * The query will automatically synchronize the user's information with the backend and fetch the list of users when the component using this hook is mounted and the user is signed in.
 * The query will also refetch the users whenever the user's authentication state changes (e.g., when the user signs in or out).
 * The query will return the list of users from the backend, which can be used to display user information in the UI or for other purposes.
 */
export const useUserSync = () => {
	const { getToken } = useAuth();

	return useQuery<IUser[]>({
		queryKey: ["users"],
		queryFn: async () => {
			const token = await getToken();
			const res = await axiosInstance.get<IUser[]>("/users", {
				headers: { Authorization: `Bearer ${token}` },
			});
			return res.data;
		},
	});
};
