import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "./AuthLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon, Mail01Icon, LockPasswordIcon, ArrowRight01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [internalError, setInternalError] = useState("");

  // Handle mode from query params if any
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mode");
    if (m === "signup") setMode("signup");
    else setMode("login");
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalError("");
    
    if (!email || !password || (mode === "signup" && !name)) {
      setInternalError("Please fill in all fields.");
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
        navigate("/verify-email", { state: { email } });
      }
    } else {
      if (result.error?.includes("Email not confirmed")) {
        navigate("/verify-email", { state: { email } });
        toast({
          title: "Please verify your email",
          description: "We've requested a verification for this account. Check your inbox.",
        });
      } else {
        toast({
          title: mode === "login" ? "Login Failed" : "Registration Failed",
          description: result.error || "Please check your details and try again.",
          variant: "destructive"
        });
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hair"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
            <span className="bg-white px-3 text-soft font-bold">Or continue with</span>
          </div>
        </div>

        <button 
          type="button" 
          className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-hair bg-white hover:bg-cream transition-all text-xs font-bold uppercase tracking-wider"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </form>
    </AuthLayout>
  );
}
