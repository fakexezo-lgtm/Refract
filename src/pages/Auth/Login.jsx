import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "./AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon, Mail01Icon, LockPasswordIcon, ArrowRight01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail } from "@/lib/authErrorMap";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, authChecked } = useAuth();
  const { toast } = useToast();

  
  
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [internalError, setInternalError] = useState("");

  // Handle mode from query params or pathname
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mode");
    if (m === "signup" || location.pathname === "/signup") setMode("signup");
    else setMode("login");
  }, [location]);

  if (!authChecked) {
    return (
      <AuthLayout 
        title={mode === "login" ? "Welcome back" : "Create account"} 
        subtitle="Initializing secure connection..."
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-charcoal/10 border-t-charcoal rounded-full animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalError("");
    
    if (mode === "signup" && !name.trim()) {
      setInternalError("Name is required");
      return;
    }
    if (!email.trim()) {
      setInternalError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setInternalError("Enter a valid email address");
      return;
    }
    if (!password) {
      setInternalError("Password is required");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setInternalError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    let result;
    if (mode === "login") {
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }
    setLoading(false);

    if (result.success) {
      if (mode === "login") {
        navigate("/app");
      } else {
        // Always go through email verification — never skip this step
        navigate("/verify-email", { state: { email } });
      }
    } else {
      if (result.code === "EMAIL_NOT_VERIFIED" || result.nextAction === "resend_verification") {
        navigate("/verify-email", { state: { email } });
        toast({
          title: "Please verify your email",
          description: "Please verify your email before logging in.",
        });
      } else {
        setInternalError(result.error || (mode === "login" ? "Invalid email or password" : "Unable to create account. Try again"));
      }
    }
  };

  return (
    <AuthLayout 
      title={mode === "login" ? "Welcome back" : "Join Refract"} 
      subtitle={mode === "login" 
        ? "Sign in to your dashboard to continue where you left off." 
        : "The quieter CRM for independent operators. Start focused work today."
      }
    >
      {/* Tabs */}
      <div className="flex p-1 bg-cream/50 rounded-2xl mb-8 relative">
        <motion.div 
          className="absolute inset-y-1 bg-white rounded-xl shadow-sm border border-hair"
          initial={false}
          animate={{ x: mode === "login" ? "0%" : "100%", width: "50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <button 
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${mode === "login" ? "text-ink" : "text-soft"}`}
        >
          Login
        </button>
        <button 
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${mode === "signup" ? "text-ink" : "text-soft"}`}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {internalError && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium overflow-hidden"
            >
              {internalError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mode === "signup" && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              <label className="text-xs font-semibold text-soft ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-soft/50 group-focus-within:text-ink transition-colors">
                  <HugeiconsIcon icon={UserIcon} size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Marianne Lavoie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 h-11 rounded-xl bg-cream/30 border border-hair focus:bg-white focus:outline-none focus:ring-4 focus:ring-charcoal/5 focus:border-charcoal/20 transition-all text-sm"
                  required={mode === "signup"}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-semibold text-soft">Password</label>
            {mode === "login" && (
              <button 
                type="button" 
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-soft hover:text-ink transition-colors underline decoration-hair"
              >
                Forgot?
              </button>
            )}
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-soft/50 group-focus-within:text-ink transition-colors">
              <HugeiconsIcon icon={LockPasswordIcon} size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 rounded-xl bg-charcoal text-white font-medium hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {mode === "login" ? "Sign in" : "Create account"}
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
