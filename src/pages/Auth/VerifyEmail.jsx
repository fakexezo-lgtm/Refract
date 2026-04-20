import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "./AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, isAuthenticated, verifyEmail, resendVerification, authChecked } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const targetEmail = user?.email || state?.email;

  useEffect(() => {
    if (isAuthenticated && user?.email_verified) {
      if (user.onboarded) {
        navigate("/app");
      } else {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (!authChecked) {
    return (
      <AuthLayout title="Verify email" subtitle="Checking security...">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-charcoal/10 border-t-charcoal rounded-full animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!targetEmail) {
      setError("Invalid verification link");
      return;
    }
    if (!code) {
      setError("Invalid verification link");
      return;
    }
    setLoading(true);
    setError("");

    const result = await verifyEmail(code, targetEmail);
    if (result.success) {
      // Navigation is handled by useEffect
    } else {
      setError(result.error || "Verification failed. Please check the code.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!targetEmail) {
      setError("Invalid verification link");
      return;
    }
    setResending(true);
    const result = await resendVerification(targetEmail);
    setResending(false);
    if (result.success) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
      return;
    }
    setError(result.error || "Unable to send verification email. Try again.");
  };


  return (
    <AuthLayout 
      title="Verify your email" 
      subtitle={`We've sent a 6-digit code to ${targetEmail || "your inbox"}.`}
    >
      <div className="flex flex-col items-center">
        <form onSubmit={handleVerify} className="w-full space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-soft ml-1">Verification Code</label>
            <input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 h-11 tracking-[0.5em] text-center font-mono rounded-xl bg-cream/30 border border-hair focus:bg-white focus:outline-none focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal/20 transition-all text-lg"
              required
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full h-11 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify account"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-hair w-full text-center">
          <p className="text-sm text-soft">
            Didn't receive it?{" "}
            <button 
              onClick={handleResend}
              disabled={resending || resendSuccess}
              className="text-ink font-semibold hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : resendSuccess ? "Sent!" : "Resend code"}
            </button>
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="mt-4 w-full h-11 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center text-sm"
          >
            Back to login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
