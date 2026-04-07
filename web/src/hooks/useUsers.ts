import axiosInstance from "@/lib/axios";
import type { IUser } from "@/types";
import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Custom hook to synchronize the authenticated user's information with the backend.
 * @returns An object containing the synchronization state, including whether the user information is currently being synchronized and whether it has been successfully synchronized.
 */
export const useUsers = () => {
	const { isSignedIn, getToken } = useAuth();

	const {
		mutate: syncUser,
		isPending,
		isSuccess,
	} = useMutation<IUser>({
		mutationFn: async () => {
			const token = await getToken();

			const response = await axiosInstance.post<IUser>(
				"/auth/callback",
				{},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			return response.data;
		},
	});

	useEffect(() => {
		if (isSignedIn && !isPending && !isSuccess) {
			syncUser();
		}
	}, [isPending, isSignedIn, isSuccess, syncUser]);

	return { isSynced: isSuccess, isSyncing: isPending } satisfies { isSynced: boolean; isSyncing: boolean };
};
