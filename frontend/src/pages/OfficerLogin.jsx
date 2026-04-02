import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser } from '../api/auth.js';
import { useAuth } from '../context/useAuth.js';
import './auth.css';

const Field = ({ id, label, stagger, children }) => (
    <div className={`flex flex-col gap-0 auth-field-${stagger}`}>
        <label htmlFor={id}
               className="text-[0.8125rem] font-medium text-[#42454e] uppercase tracking-[0.05em] mb-[0.7rem]">
            {label}
        </label>
        {children}
    </div>
);

const OfficerLogin = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginUser({ email, password });
            const userRes = await getCurrentUser();
            const user = userRes.data.data[0];
            setUser(user);
            const role = user?.role;
            if (role === 'officer')      navigate('/officer/dashboard');
            else if (role === 'admin')   navigate('/admin/dashboard');
            else if (role === 'citizen') navigate('/citizen/dashboard');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                backgroundColor: '#f8f9fa',
                backgroundImage:
                    'radial-gradient(ellipse 80% 60% at 10% 0%, rgba(0,63,135,0.07) 0%, transparent 60%), ' +
                    'radial-gradient(ellipse 60% 50% at 90% 100%, rgba(0,86,179,0.06) 0%, transparent 55%)',
            }}
        >
            <div
                className="animate-auth-fade-up w-full max-w-[960px] min-h-[580px] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
                style={{ boxShadow: '0 4px 40px rgba(0,63,135,0.10), 0 2px 8px rgba(0,63,135,0.06)' }}
            >
                {/* ── Brand Panel ──────────────────────────── */}
                <aside
                    className="hidden md:flex flex-col justify-between px-10 py-12 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)' }}
                >
                    <span className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                          style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <span className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full pointer-events-none"
                          style={{ background: 'rgba(255,255,255,0.04)' }} />

                    {/* Logo */}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-sm"
                             style={{ background: 'rgba(255,255,255,0.18)' }}>
                            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-[1.125rem] font-semibold text-white/95 tracking-[-0.01em]">CivilPortal</p>
                            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.05em] text-white/55">Officer Portal</p>
                        </div>
                    </div>

                    {/* Hero copy */}
                    <div className="relative z-10">
                        <h2 className="text-[clamp(1.8rem,3vw,2.2rem)] font-bold text-white leading-[1.2] tracking-[-0.02em] mb-4">
                            Uphold the<br />law with<br />precision.
                        </h2>
                        <p className="text-[1rem] text-white/70 leading-[1.65] max-w-[280px]">
                            Issue challans, manage violations, and track
                            enforcement activity from a single command centre.
                        </p>
                        <div className="flex gap-6 mt-8">
                            {[['Fast', 'Challan issuance'], ['Live', 'Violation data'], ['Secure', 'Access']].map(([val, lbl]) => (
                                <div key={lbl} className="flex flex-col">
                                    <span className="text-[1.375rem] font-bold text-white tracking-[-0.02em]">{val}</span>
                                    <span className="text-[0.6875rem] font-medium uppercase tracking-[0.05em] text-white/55 mt-0.5">{lbl}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-[0.6875rem] text-white/40 tracking-[0.04em] relative z-10">
                        © 2025 Civil Traffic Authority · All rights reserved
                    </p>
                </aside>

                {/* ── Form Panel ───────────────────────────── */}
                <main className="flex flex-col justify-center gap-8 px-8 md:px-10 py-10 overflow-y-auto bg-white">
                    <div>
                        <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-2">
                            Officer Access
                        </p>
                        <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-[1.2]">
                            Officer Sign In
                        </h1>
                        <p className="text-[0.9375rem] text-[#42454e] mt-2 leading-[1.6]">
                            Sign in to your enforcement officer account.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        {error && (
                            <div className="animate-auth-slide-down rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                                 style={{ background: '#ffdad6', color: '#ba1a1a' }}>
                                {error}
                            </div>
                        )}

                        <Field id="officer-login-email" label="Email Address" stagger={1}>
                            <input
                                id="officer-login-email"
                                type="email"
                                placeholder="officer@authority.gov.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full rounded-xl px-[1.1rem] py-[0.875rem] text-[0.9375rem] text-[#1a1d23] outline-none transition-all duration-200"
                                style={{ background: '#d8dde5', border: 'none' }}
                                onFocus={(e) => { e.target.style.background = '#e0e4ea'; e.target.style.boxShadow = '0 0 0 2px #003f87'; }}
                                onBlur={(e)  => { e.target.style.background = '#d8dde5'; e.target.style.boxShadow = 'none'; }}
                            />
                        </Field>

                        <Field id="officer-login-password" label="Password" stagger={2}>
                            <input
                                id="officer-login-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="w-full rounded-xl px-[1.1rem] py-[0.875rem] text-[0.9375rem] text-[#1a1d23] outline-none transition-all duration-200"
                                style={{ background: '#d8dde5', border: 'none' }}
                                onFocus={(e) => { e.target.style.background = '#e0e4ea'; e.target.style.boxShadow = '0 0 0 2px #003f87'; }}
                                onBlur={(e)  => { e.target.style.background = '#d8dde5'; e.target.style.boxShadow = 'none'; }}
                            />
                        </Field>

                        <button
                            id="officer-login-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-[1.5rem] py-[0.95rem] text-[0.9375rem] font-semibold text-white tracking-[0.01em] transition-all duration-200 mt-1"
                            style={{
                                background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
                                boxShadow: '0 4px 20px rgba(0,63,135,0.28)',
                                border: 'none',
                                opacity: loading ? 0.75 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={(e) => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 28px rgba(0,63,135,0.36)'; } }}
                            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(0,63,135,0.28)'; }}
                            onMouseDown={(e)  => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 10px rgba(0,63,135,0.22)'; }}
                        >
                            {loading ? 'Authenticating…' : 'Sign In as Officer'}
                        </button>
                    </form>

                    <p className="text-[0.875rem] text-[#42454e] text-center leading-[1.7]">
                        New officer?{' '}
                        <button
                            id="officer-login-go-register"
                            onClick={() => navigate('/officer/register')}
                            className="text-[#003f87] font-medium bg-transparent border-none cursor-pointer p-0 hover:underline hover:opacity-75 transition-opacity duration-150"
                            style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                        >
                            Create officer account
                        </button>
                    </p>
                </main>
            </div>
        </div>
    );
};

export default OfficerLogin;
