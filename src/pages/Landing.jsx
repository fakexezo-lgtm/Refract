import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon, UserIcon, SparklesIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function Landing() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-whisper text-ink">
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Refract" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-xl">Refract</span>
        </div>
        <nav className="flex items-center gap-1 md:gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="px-4 py-2 text-sm text-soft hover:text-ink transition">Log in</Link>
              <Link to="/signup" className="px-4 py-2 rounded-full text-sm bg-charcoal text-white hover:bg-black transition">Sign up</Link>
            </>
          ) : (
            <Link to="/app" className="px-5 py-2 rounded-full text-sm bg-charcoal text-white hover:bg-black transition">
              Go to Dashboard
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-10 md:pt-24 pb-16 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-hair text-xs text-soft mb-6">
            <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3" /> A quieter CRM for independent operators
          </div>
          <h1 className="font-serif text-[44px] leading-[1.05] md:text-[76px] md:leading-[1.02] tracking-tight mb-6">
            The client <em className="italic text-soft">remembered</em>,<br />
            the follow-up <em className="italic text-soft">kept</em>.
          </h1>
          <p className="text-lg md:text-xl text-soft max-w-xl mb-8 leading-relaxed">
            Refract is a client-centric CRM for freelancers and small teams.
            Every note, task, and deal lives on a single timeline — so you always know who, what, and what's next.
          </p>
          <div className="flex flex-wrap gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/signup" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-charcoal text-white hover:bg-black transition group">
                  Get started
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-hair text-ink hover:bg-cream transition">
                  Log in
                </Link>
              </>
            ) : (
              <Link to="/app" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal text-white hover:bg-black transition group">
                Continue to Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </motion.div>


        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
          className="mt-16 md:mt-24 relative"
        >
          <div className="rounded-3xl overflow-hidden border border-hair shadow-2xl shadow-black/5 bg-charcoal">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 p-8 md:p-10 bg-charcoal text-white">
                <div className="text-[11px] uppercase tracking-[0.15em] text-white/50 mb-2">Client</div>
                <div className="font-serif text-3xl mb-3">Atelier Nomade</div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10">Active</span>
                  <span className="text-xs text-white/50">Last contacted 2h ago</span>
                </div>
                <div className="p-4 rounded-xl bg-[#efa36a]/15 border border-[#efa36a]/30">
                  <div className="text-[11px] uppercase tracking-wider text-[#efa36a] mb-1">Next action</div>
                  <div className="text-sm">Send revised proposal</div>
                  <div className="text-xs text-white/50 mt-1">Due today</div>
                </div>
              </div>
              <div className="md:col-span-3 p-8 md:p-10 bg-cream">
                <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-4">Timeline</div>
                {[
                  { t: "Note added", s: "Loved the new direction, wants to finalize by Friday.", when: "2h ago" },
                  { t: "Task completed", s: "Sent initial mood board", when: "Yesterday" },
                  { t: "Stage → Proposal", s: "Moved from Contacted", when: "2d ago" },
                ].map((it, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.12 }}
                    className="flex gap-3 py-3 border-b border-hair last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-ink mt-2 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{it.t}</div>
                      <div className="text-sm text-soft">{it.s}</div>
                    </div>
                    <div className="text-xs text-soft shrink-0">{it.when}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 border-t border-hair">
        <div className="mb-12 max-w-xl">
          <div className="text-[11px] uppercase tracking-[0.15em] text-soft mb-2">What it does</div>
          <h2 className="font-serif text-4xl md:text-5xl">One place for every relationship.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: UserIcon, title: "Client-first", desc: "Every note, task, and deal belongs to a client. Context is never lost." },
            { icon: Clock01Icon, title: "Always current", desc: "Last contacted, next action, full history — visible the moment you need it." },
            { icon: CheckmarkCircle02Icon, title: "Quietly fast", desc: "Optimistic UI, command palette, and gentle motion. Designed to stay out of your way." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-hair"
            >
              <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center mb-4">
                <HugeiconsIcon icon={f.icon} className="w-4 h-4 text-ink" strokeWidth={1.75} />
              </div>
              <div className="font-serif text-xl mb-1">{f.title}</div>
              <div className="text-sm text-soft leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-24">
        <div className="rounded-3xl bg-charcoal text-white p-10 md:p-16 noise-bg relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-cream/10 blur-3xl" />
          <div className="relative max-w-xl">
            <h3 className="font-serif text-3xl md:text-5xl mb-4">Start remembering everything.</h3>
            <p className="text-white/70 mb-8">Bring your clients into a single calm workspace. Free to try.</p>
            {!isAuthenticated ? (
              <Link to="/signup" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-cream text-ink hover:bg-white transition">
                Get started <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
              </Link>
            ) : (
              <Link to="/app" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-cream text-ink hover:bg-white transition">
                Continue to Dashboard <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
        <div className="mt-10 text-xs text-soft flex justify-between items-center">
          <span>© {new Date().getFullYear()} Refract</span>
          <span>Designed & Built by Hamza Bukhari</span>
        </div>
      </section>
    </div>
  );
}
