import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
	throw new Error("VITE_API_URL is not defined in the environment variables");
}

const axiosInstance = axios.create({
	baseURL: `${apiUrl}/api`,
	withCredentials: true,
});

export default axiosInstance;
