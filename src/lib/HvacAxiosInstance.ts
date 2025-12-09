import axios from "axios";

const HvacAxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: false,
});

// Show the toast if backend server is down
HvacAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response.data;

    // console.log(`error data: ${JSON.stringify(data, null, 2)}`);
    if (data.status === 500) {
      return Promise.reject(data.message);
    }
    return Promise.reject(data.message);
  }
);


export default HvacAxiosInstance;