import React, { useState } from "react";
import Axios from "../axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // Import CSS file

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await Axios.post("/api/auth/login", { email, password });
    localStorage.setItem("token", res.data.token); 
    // navigate immediately
    navigate("/home");
  } catch (err: any) {
    alert(err.response?.data?.message || "Error occurred");
  }
};

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <p color="black">
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
