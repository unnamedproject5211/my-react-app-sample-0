// src/pages/Register.tsx
import React, { useState } from "react";
import Axios from "../axios"; // ✅ Your axios instance
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Handle Register Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ Send name, email, and password to backend
      const res = await Axios.post("/api/auth/register", { name, email, password });

      // ✅ Show success message from backend
      alert(res.data.message || "Registered successfully!");

      // ✅ NEW: Redirect user to OTP verification page (send email in URL)
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
        />

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

        <button type="submit">Register</button>

        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
