import axios from "axios";

// Dynamically switch backend URL based on environment
const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:5000";

const Axios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default Axios;
