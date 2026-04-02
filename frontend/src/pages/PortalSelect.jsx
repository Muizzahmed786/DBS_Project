import { useNavigate } from 'react-router-dom';
import './auth.css';

/* ── Design tokens ───────────────────────────────────────────── */
const PRIMARY = '#003f87';

const PORTALS = [
    {
        id: 'citizen',
        label: 'Citizen',
        sublabel: 'Personal Portal',
        description: 'Manage your challans, vehicles, documents, and payment history.',
        loginPath: '/login',
        registerPath: '/register',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        ),
        features: ['View & pay challans', 'Vehicle registration', 'Document uploads'],
        accent: { from: '#003f87', to: '#0056b3' },
        badgeBg: 'rgba(0,63,135,0.08)',
        badgeColor: PRIMARY,
    },
    {
        id: 'officer',
        label: 'Officer',
        sublabel: 'Enforcement Portal',
        description: 'Issue challans, record violations, and manage enforcement activity.',
        loginPath: '/officer/login',
        registerPath: '/officer/register',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
        ),
        features: ['Issue challans', 'Record violations', 'Licence management'],
        accent: { from: '#065f46', to: '#059669' },
        badgeBg: 'rgba(5,150,105,0.08)',
        badgeColor: '#059669',
    },
    {
        id: 'admin',
        label: 'Administrator',
        sublabel: 'Admin Console',
        description: 'Full system control — users, RTO offices, and enforcement data.',
        loginPath: '/admin/login',
        registerPath: null,          // admins are provisioned by backend only
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93A10 10 0 0 0 19.07 19.07"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
        ),
        features: ['User management', 'Challan oversight', 'System configuration'],
        accent: { from: '#001f4d', to: '#003f87' },
        badgeBg: 'rgba(0,31,77,0.08)',
        badgeColor: '#001f4d',
    },
];

/* ── Portal Card ─────────────────────────────────────────────── */
const PortalCard = ({ portal, onLogin, onRegister }) => {
    const { label, sublabel, description, icon, features, accent, badgeBg, badgeColor, registerPath } = portal;

    return (
        <div
            className="group relative bg-white rounded-2xl flex flex-col overflow-hidden cursor-default"
            style={{
                boxShadow: '0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,63,135,0.14), 0 2px 8px rgba(0,63,135,0.06)';
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Gradient header strip */}
            <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${accent.from} 0%, ${accent.to} 100%)` }}
            />

            <div className="flex flex-col flex-1 p-7 gap-5">
                {/* Icon + badge */}
                <div className="flex items-start justify-between">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
                            color: '#fff',
                            boxShadow: `0 4px 16px ${accent.from}44`,
                        }}
                    >
                        {icon}
                    </div>
                    <span
                        className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] px-2.5 py-1 rounded-full"
                        style={{ background: badgeBg, color: badgeColor }}
                    >
                        {sublabel}
                    </span>
                </div>

                {/* Title + description */}
                <div>
                    <h2 className="text-[1.25rem] font-bold tracking-[-0.02em] text-[#1a1d23]">{label}</h2>
                    <p className="text-[0.9rem] text-[#42454e] mt-1.5 leading-[1.65]">{description}</p>
                </div>

                {/* Feature list */}
                <ul className="flex flex-col gap-2 mt-auto">
                    {features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-[0.875rem] text-[#42454e]">
                            <span
                                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[0.625rem] font-bold text-white"
                                style={{ background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)` }}
                            >
                                ✓
                            </span>
                            {f}
                        </li>
                    ))}
                </ul>

                {/* CTAs */}
                <div className="flex flex-col gap-2.5 pt-2">
                    {/* Primary: Sign In */}
                    <button
                        onClick={onLogin}
                        className="w-full rounded-[1.5rem] py-[0.875rem] text-[0.9375rem] font-semibold text-white transition-all duration-200"
                        style={{
                            background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
                            boxShadow: `0 4px 16px ${accent.from}44`,
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Sign In
                    </button>

                    {/* Secondary: Create account (only if registerPath exists) */}
                    {registerPath && (
                        <button
                            onClick={onRegister}
                            className="w-full rounded-[1.5rem] py-[0.8125rem] text-[0.875rem] font-medium transition-all duration-200"
                            style={{
                                background: badgeBg,
                                color: badgeColor,
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                            Create Account
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Page ────────────────────────────────────────────────────── */
const PortalSelect = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
            style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                backgroundColor: '#f8f9fa',
                backgroundImage:
                    'radial-gradient(ellipse 90% 60% at 15% 0%, rgba(0,63,135,0.07) 0%, transparent 55%), ' +
                    'radial-gradient(ellipse 70% 50% at 85% 100%, rgba(0,86,179,0.05) 0%, transparent 50%)',
            }}
        >
            {/* ── Brand header ───────────────────────────── */}
            <div className="flex flex-col items-center text-center mb-14 animate-auth-fade-up">
                {/* Logo mark */}
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                        background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
                        boxShadow: '0 8px 28px rgba(0,63,135,0.28)',
                    }}
                >
                    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                </div>

                <p className="text-[0.8125rem] font-medium uppercase tracking-[0.1em] mb-2"
                   style={{ color: PRIMARY }}>
                    Civil Traffic Authority
                </p>
                <h1 className="text-[2.5rem] font-bold tracking-[-0.03em] leading-[1.1] text-[#1a1d23] max-w-md">
                    Welcome to<br />CivilPortal
                </h1>
                <p className="text-[1rem] text-[#42454e] mt-4 leading-[1.65] max-w-sm">
                    Choose your portal to continue. Each portal is tailored
                    to your role within the system.
                </p>
            </div>

            {/* ── Portal cards ───────────────────────────── */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5 animate-auth-fade-up">
                {PORTALS.map((portal) => (
                    <PortalCard
                        key={portal.id}
                        portal={portal}
                        onLogin={() => navigate(portal.loginPath)}
                        onRegister={() => portal.registerPath && navigate(portal.registerPath)}
                    />
                ))}
            </div>

            {/* ── Footer ─────────────────────────────────── */}
            <p className="mt-14 text-[0.75rem] text-[#42454e]/50 tracking-[0.04em]">
                © 2025 Civil Traffic Authority · All rights reserved
            </p>
        </div>
    );
};

export default PortalSelect;
