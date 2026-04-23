import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "./AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, ArrowRight01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail } from "@/constants/authErrorMap";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    // Security-safe response: keep the same success message regardless of account existence.
    setSent(true);
  };

  return (
    <AuthLayout 
      title={sent ? "Check your inbox" : "Recover password"} 
      subtitle={sent 
        ? `If this email exists, a reset link has been sent to ${email}.`
        : "Enter your email and we'll send you a link to reset your password."
      }
    >
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-soft ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-soft/50 group-focus-within:text-ink transition-colors">
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 h-11 rounded-xl bg-cream/30 border border-hair focus:bg-white focus:outline-none focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal/20 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Send reset link
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center mb-6 text-charcoal">
              <HugeiconsIcon icon={Tick01Icon} size={28} />
            </div>
            <p className="text-sm text-soft leading-relaxed mb-8">
              Click the link in the email to set a new password. If you don't see it, check your spam folder.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-11 rounded-xl border border-hair hover:bg-cream transition-all text-sm font-semibold"
            >
              Back to login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!sent && (
        <div className="mt-8 pt-6 border-t border-hair text-center">
          <p className="text-sm text-soft">
            Suddenly remembered? <Link to="/login" className="text-ink font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

