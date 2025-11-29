import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Axios from "../axios";
import "./VerifyOtp.css"; // ✅ Import CSS

const VerifyOtp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const email = initialEmail;
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await Axios.post("/api/auth/verify-otp", { email, otp });
      alert(res.data.message || "Verified");
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      navigate("/home");
    } catch (err: any) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      const res = await Axios.post("/api/auth/resend-otp", { email });
      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Resend failed");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Verify your email</h2>
        <p>OTP sent to: <strong>{email}</strong></p>
        <form onSubmit={handleVerify}>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            required
          />
          <button type="submit" className="verify-btn">Verify</button>
        </form>
        <button onClick={handleResend} className="resend-btn">Resend OTP</button>
      </div>
    </div>
  );
};

export default VerifyOtp;
