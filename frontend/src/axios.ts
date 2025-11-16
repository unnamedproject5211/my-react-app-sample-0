import axios from "axios";

// Dynamically switch backend URL based on environment
const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:5000";

console.log("Using backend baseURL:", baseURL);

const Axios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔒 Automatically attach token before every request
Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default Axios;
