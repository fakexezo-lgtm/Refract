import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "./AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockPasswordIcon, ArrowRight01Icon, Tick01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/services/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword, getRecoveryState } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [linkState, setLinkState] = useState("checking");

  React.useEffect(() => {
    let mounted = true;
    const checkRecoveryState = async () => {
      // PKCE flow: exchange the code from the URL for a session
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!mounted) return;
          if (error) {
            setError(error.message || "Invalid or expired reset link");
            setLinkState("invalid");
            return;
          }
          if (data?.session) {
            setLinkState("valid");
            return;
          }
        } catch (err) {
          if (!mounted) return;
          setError("Invalid or expired reset link");
          setLinkState("invalid");
          return;
        }
      }

      // Fallback: check for legacy hash-based tokens or existing recovery session
      const result = await getRecoveryState();
      if (!mounted) return;
      if (result.valid) {
        setLinkState("valid");
        return;
      }
      if (result.reason === "EXPIRED_LINK") {
        setError("This reset link has expired");
      } else {
        setError("Invalid reset link");
      }
      setLinkState("invalid");
    };
    checkRecoveryState();
    return () => {
      mounted = false;
    };
  }, [getRecoveryState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    if (!confirmPassword) {
      setError("Confirm password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(password);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "An unknown error occurred. Please try again.");
    }
  };

  return (
    <AuthLayout 
      title={success ? "Password reset" : "Set new password"} 
      subtitle={success 
        ? "Your password has been updated. You can now sign in with your new credentials."
        : "Choose a secure password for your Refract account."
      }
    >
      {linkState === "checking" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-charcoal/10 border-t-charcoal rounded-full animate-spin" />
        </div>
      )}
      <AnimatePresence mode="wait">
        {!success && linkState === "valid" ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-soft ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-soft/50 group-focus-within:text-ink transition-colors">
                  <HugeiconsIcon icon={LockPasswordIcon} size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 h-11 rounded-xl bg-cream/30 border border-hair focus:bg-white focus:outline-none focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal/20 transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-soft/50 hover:text-ink transition-colors"
                >
                  <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-soft ml-1">Confirm Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 h-11 rounded-xl bg-cream/30 border border-hair focus:bg-white focus:outline-none focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal/20 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Update password
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        ) : !success && linkState === "invalid" ? (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
            className="text-center py-4"
          >
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium mb-6">
              {error || "Invalid reset link"}
            </div>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full h-11 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all flex items-center justify-center"
            >
              Request a new reset link
            </button>
          </motion.div>
        ) : success ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center mb-6 text-charcoal">
              <HugeiconsIcon icon={Tick01Icon} size={28} />
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-11 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all flex items-center justify-center gap-2 group"
            >
              Sign in to Refract
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AuthLayout>
  );
}

