import { Link } from "react-router-dom";
import {
  Car,
  FileText,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Bike,
  ClipboardCheck,
  UserPlus,
  BadgeCheck,
  TrafficCone,
} from "lucide-react";

const FEATURES = [
  {
    icon: Car,
    title: "Vehicle Registration",
    desc: "Register and manage all your vehicles under one account, with instant access to RC details.",
  },
  {
    icon: FileText,
    title: "Digital Licence",
    desc: "Get your driving licence issued, renewed, and verified — no paperwork, no queues.",
  },
  {
    icon: ClipboardCheck,
    title: "Challan Tracking",
    desc: "See every challan issued to you, filter by status, and know exactly what's outstanding.",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    desc: "Clear pending challans online via UPI, card, or net banking in under a minute.",
  },
  {
    icon: ShieldCheck,
    title: "Document Vault",
    desc: "Upload Aadhaar, insurance, and RC documents once — access them anywhere, anytime.",
  },
  {
    icon: BadgeCheck,
    title: "Officer Console",
    desc: "A dedicated portal for traffic officers to issue licences and challans on the spot.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create your account",
    desc: "Sign up with your mobile number or email in under two minutes.",
  },
  {
    n: "2",
    title: "Add your vehicles",
    desc: "Link your registered vehicles and licence to your profile.",
  },
  {
    n: "3",
    title: "Manage everything",
    desc: "Track challans, pay fines, and keep your documents up to date — all from one place.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-blue-50/40 text-slate-800">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .float-card { animation: float 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .float-card { animation: none; }
        }
      `}</style>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrafficCone size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-[15px] tracking-tight">
              Parivahan
            </span>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-px active:translate-y-0"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="fade-up">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-5">
            <ShieldCheck size={12} />
            Digital Motor Vehicle Services
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-5">
            Your vehicle, licence, and challans — in one place.
          </h1>
          <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-md">
            Parivahan brings vehicle registration, driving licences, challan
            payments, and document storage into a single account, so you never
            have to visit an RTO for routine tasks again.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get started
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-6 py-3 rounded-xl border border-blue-100 hover:border-blue-200 bg-white transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* Signature illustration — fanned document stack */}
        <div
          className="fade-up relative h-72 sm:h-80 flex items-center justify-center"
          style={{ animationDelay: "120ms" }}
        >
          <div className="relative w-64">
            <div
              className="float-card absolute inset-0 -rotate-6 bg-white border border-blue-100 rounded-2xl shadow-md p-5"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500 mb-6">
                <TrafficCone size={16} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                Registration
              </p>
              <p className="font-mono font-bold text-slate-800 tracking-widest">
                KA 05 AB 1234
              </p>
            </div>

            <div
              className="float-card absolute inset-0 rotate-3 bg-white border border-blue-100 rounded-2xl shadow-md p-5"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500 mb-6">
                <FileText size={16} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                Driving Licence
              </p>
              <p className="font-mono font-bold text-slate-800 tracking-widest">
                Valid till 2036
              </p>
            </div>

            <div
              className="float-card relative rotate-0 bg-white border border-blue-100 rounded-2xl shadow-xl p-5"
              style={{ animationDelay: "0s" }}
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6">
                <CreditCard size={16} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                Challan Status
              </p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800">All clear</p>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <BadgeCheck size={11} />
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 max-w-lg">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Everything the RTO handles, now in your pocket
          </h2>
          <p className="text-slate-500 text-sm">
            Built for citizens and traffic officers alike — one platform, two
            roles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-slate-800 text-[15px] mb-1.5">
                {title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 max-w-lg">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Set up once, use for years
          </h2>
          <p className="text-slate-500 text-sm">
            Three steps, and you're fully onboarded.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block h-px flex-1 bg-blue-100" />
                )}
              </div>
              <h3 className="font-bold text-slate-800 text-[15px] mb-1.5">
                {s.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-indigo-600 rounded-3xl px-8 py-12 sm:px-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1.5">
              Ready to get started?
            </h2>
            <p className="text-indigo-100 text-sm">
              Create your free account and link your vehicles in minutes.
            </p>
          </div>
          <Link
            to="/register"
            className="group flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            Create account
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Brand */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg">
                <TrafficCone size={24} className="text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Parivahan
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Smart Motor Vehicle Management Portal
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm text-slate-600 max-w-xl">
              Simplifying vehicle registration, driving licence management, and
              e-Challan services through one unified platform.
            </p>

            {/* Developers */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">
                Developed By
              </h4>

              <div className="flex flex-wrap justify-center gap-8 text-lg font-serif italic text-slate-700">
                <span>Samarth</span>
                <span>Muizz</span>
                <span>Suraj</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Parivahan. All rights reserved.
            </p>

            <p className="text-sm text-slate-400">
              Built with React • Node.js • Express • MySQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
