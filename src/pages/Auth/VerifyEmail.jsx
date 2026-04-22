import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "./AuthLayout";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, isAuthenticated, verifyEmail, resendVerification, authChecked } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verified, setVerified] = useState(false);

  // Email from route state (passed after signup) or from logged-in user
  const targetEmail = state?.email || user?.email;

  // Only auto-redirect if:
  // 1. Auth is resolved
  // 2. User is authenticated + verified
  // 3. We got here AFTER a successful OTP verify (verified === true)
  //    OR the user navigated here directly while already verified (e.g. bookmarked URL)
  // This prevents the bypass when email confirmation is OFF in Supabase
  useEffect(() => {
    if (!authChecked) return;

    // If just verified via OTP, redirect to onboarding
    if (verified && isAuthenticated && user?.email_verified) {
      navigate(user.onboarded ? "/app" : "/onboarding", { replace: true });
      return;
    }

    // If user navigated here directly and is already fully verified (not from signup flow)
    // Only redirect if there's no pending email state (i.e., not just signed up)
    if (!state?.email && isAuthenticated && user?.email_verified) {
      navigate(user.onboarded ? "/app" : "/onboarding", { replace: true });
    }
  }, [authChecked, isAuthenticated, user, navigate, verified, state]);

  // If no email and not authenticated — nothing to verify, back to login
  if (authChecked && !targetEmail) {
    return (
      <AuthLayout title="Verify your email" subtitle="No email address found.">
        <div className="space-y-4 text-center">
          <p className="text-sm text-soft">
            We couldn't find your email. Please go back and sign up again.
          </p>
          <button
            onClick={() => navigate("/login?mode=signup")}
            className="w-full h-11 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98]"
          >
            Back to signup
          </button>
        </div>
      </AuthLayout>
    );
  }

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
      setError("No email address found. Please go back and sign up again.");
      return;
    }
    if (code.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    setError("");

    const result = await verifyEmail(code, targetEmail);
    if (result.success) {
      setVerified(true);
      // useEffect will handle redirect once auth state updates
    } else {
      setError(result.error || "Verification failed. Please check the code.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!targetEmail) {
      setError("No email address found. Please go back and sign up again.");
      return;
    }
    setResending(true);
    setError("");
    const result = await resendVerification(targetEmail);
    setResending(false);
    if (result.success) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setError(result.error || "Unable to send verification email. Try again.");
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`We sent a 6-digit verification code to`}
    >
      <div className="flex flex-col items-center">
        {/* Email display */}
        <div className="w-full mb-6 p-3 rounded-xl bg-cream/50 border border-hair text-center">
          <p className="text-sm font-semibold text-ink truncate">{targetEmail}</p>
        </div>

        <form onSubmit={handleVerify} className="w-full space-y-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium text-center overflow-hidden"
              >
                {error}
              </motion.div>
            )}
            {resendSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium text-center overflow-hidden"
              >
                ✓ New code sent — check your inbox
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-soft ml-1">
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                // Allow alphanumeric — Supabase OTPs can be numeric or alphanumeric
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
                setCode(val);
                if (error) setError("");
              }}
              className="w-full px-4 h-14 tracking-[0.6em] text-center font-mono rounded-xl bg-cream/30 border border-hair focus:bg-white focus:outline-none focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal/20 transition-all text-2xl"
              required
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full h-11 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Verify account →"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-hair w-full text-center space-y-3">
          <p className="text-sm text-soft">
            Didn't receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendSuccess}
              className="text-ink font-semibold hover:underline disabled:opacity-40 transition-opacity"
            >
              {resending ? "Sending..." : resendSuccess ? "Sent ✓" : "Resend code"}
            </button>
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs text-soft hover:text-ink transition-colors underline decoration-hair"
          >
            Use a different account
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
