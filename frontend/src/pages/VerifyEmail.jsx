import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const EmailVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSendVerificationCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/verify-email",
        { email: user.email },
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.success) {
        toast.success("Verification code sent to your email!");
      } else {
        toast.error("Failed to send verification code.");
      }
    } catch (error) {
      //console.error("Error sending verification code:", error);
      toast.error("An error occurred while sending the verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/verify-email/code",
        { email: user.email, verificationCode },
        {
          withCredentials: true,
        }
      );
      //// console.log("response.data", response.data);
      if (response.data && response.data.success) {
        toast.success("Email verified successfully!");
      } else {
        toast.error("Invalid verification code.");
      }
    } catch (error) {
      //console.error("Error during email verification:", error);
      toast.error("An error occurred while verifying the email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-body-text-color flex items-center justify-center p-4">
      <div className="bg-theme-bg-light p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-heading-color mb-6 text-center">
          Email Verification
        </h1>

        {/* Send Verification Code Button */}
        <div className="mb-6">
          <button
            className="w-full py-3 bg-theme-color text-color-white rounded-md hover:bg-hover transition duration-300 disabled:bg-gray-400"
            onClick={handleSendVerificationCode}
            disabled={loading}
          >
            {loading ? "Sending Code..." : "Send Verification Code"}
          </button>
        </div>

        <form onSubmit={handleVerifyEmail} className="space-y-6">
          {/* Email (Read-Only) */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-secondary text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              readOnly
              className="mt-2 p-3 rounded-md bg-theme-bg2 text-body-text-color border-2 border-gray-300 focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Verification Code */}
          <div className="flex flex-col">
            <label
              htmlFor="verificationCode"
              className="text-secondary text-sm"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="mt-2 p-3 rounded-md bg-theme-bg2 text-body-text-color border-2 border-theme-color focus:outline-none focus:ring-2 focus:ring-theme-color"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-theme-color text-color-white rounded-md hover:bg-hover transition duration-300 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Verifying Email..." : "Verify Email"}
          </button>
        </form>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default EmailVerificationPage;
