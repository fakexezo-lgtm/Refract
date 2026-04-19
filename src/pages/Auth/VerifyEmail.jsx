import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "./AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, ArrowRight01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, verifyEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const ok = await verifyEmail();
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate("/onboarding"), 1500);
    }
  };

  return (
    <AuthLayout 
      title="Check your email" 
      subtitle={`We've sent a verification link to ${user?.email || "your inbox"}.`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-8 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-charcoal"
          >
            <HugeiconsIcon icon={Mail01Icon} size={40} />
          </motion.div>
          {success && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center border-4 border-white"
            >
              <HugeiconsIcon icon={Tick01Icon} size={16} />
            </motion.div>
          )}
        </div>

        <div className="space-y-4 w-full">
          <button
            onClick={() => window.open("https://mail.google.com", "_blank")}
            className="w-full h-12 rounded-xl border border-hair bg-white hover:bg-cream transition-all text-sm font-semibold flex items-center justify-center gap-2"
          >
            Open Gmail
          </button>

          <button
            onClick={handleVerify}
            disabled={loading || success}
            className="w-full h-12 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : success ? (
              "Verified!"
            ) : (
              <>
                Verify Now (Simulated)
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-hair w-full">
          <p className="text-sm text-soft">
            Didn't receive it? <button className="text-ink font-semibold hover:underline">Resend email</button>
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="mt-4 text-xs text-soft hover:text-ink transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
