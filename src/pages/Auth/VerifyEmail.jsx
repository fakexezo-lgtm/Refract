import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "./AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, ArrowRight01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const targetEmail = user?.email || state?.email;

  useEffect(() => {
    // If Supabase verifies the email (link clicked in another tab or this tab)
    // the authListener will catch it and update the context.
    if (isAuthenticated && user) {
      if (user.user_metadata?.onboarded) {
        navigate("/app");
      } else {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleResend = async () => {
    if (!targetEmail) return;
    setResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: targetEmail,
    });
    
    setResending(false);
    if (!error) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    }
  };

  return (
    <AuthLayout 
      title="Check your email" 
      subtitle={`We've sent a secure verification link to ${targetEmail || "your inbox"}.`}
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
        </div>

        <div className="space-y-4 w-full">
          <p className="text-sm font-medium text-ink mb-2">
            Please click the link in the email to activate your account.
          </p>
          
          <button
            onClick={() => window.location.href = "mailto:"}
            className="w-full h-12 rounded-xl border border-hair bg-white hover:bg-cream transition-all text-sm font-semibold flex items-center justify-center gap-2"
          >
            Open Mail App
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-hair w-full">
          <p className="text-sm text-soft mb-4">
            Didn't receive it? Check your spam folder or{" "}
            <button 
              onClick={handleResend}
              disabled={resending || resendSuccess}
              className="text-ink font-semibold hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : resendSuccess ? "Sent!" : "Resend email"}
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
