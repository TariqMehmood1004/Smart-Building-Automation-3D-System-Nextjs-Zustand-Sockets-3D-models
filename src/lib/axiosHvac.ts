import axios from "axios";
import toast from "react-hot-toast";


export const axiosHvacInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_HVAC_MIDEA_API_BASE_URL,
    withCredentials: false,
});


// Attach Authorization token
axiosHvacInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


// Global error toast handler
axiosHvacInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            toast.error("Server is unreachable. Please try again later.");
        } else {
            const { data } = error.response;

            const message =
                data?.message ||
                error?.message ||
                "An unknown error occurred";

            toast.error(typeof message === "string" ? message : "Unexpected error");
        }

        return Promise.reject(error?.response?.data || error);
    }
);



