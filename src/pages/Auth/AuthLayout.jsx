import React from "react";
import { motion } from "framer-motion";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-whisper flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Orbs for Premium feel */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-charcoal/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-charcoal/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-charcoal mb-4 shadow-xl">
            <img src="/logo.png" alt="Refract" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="font-serif text-3xl text-ink mb-2">{title}</h1>
          <p className="text-sm text-soft leading-relaxed">{subtitle}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/5 relative overflow-hidden">
          {children}
        </div>

        <p className="text-center mt-8 text-xs text-soft">
          &copy; {new Date().getFullYear()} Refract CRM &middot; Focused Relationship Work
        </p>
      </motion.div>
    </div>
  );
}
