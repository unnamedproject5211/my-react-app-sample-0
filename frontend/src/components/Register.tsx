import React, { useState } from "react";
import Axios from "../axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // Import CSS file

const Register: React.FC = () => {
  const [name, setName] = useState("");       // ✅ Added name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Axios.post("/api/auth/register", { name, email, password }); // ✅ Send name also
      alert("Registered successfully");
      navigate("/login");
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
