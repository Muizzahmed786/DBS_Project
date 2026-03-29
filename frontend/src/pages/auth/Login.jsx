import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser } from '../../api/auth.js';
import { useAuth } from "../context/useAuth";

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            // 1. Login → backend sets cookie
            const response = await loginUser({ email, password });

            if (!(response.status >= 200 && response.status < 300)) {
                throw new Error("Login failed, please try again");
            }

            // 2. Fetch user using cookie
            const userRes = await getCurrentUser();

            // 3. Store in context (NOT localStorage)
            setUser(userRes.data);

            // 4. Navigate
            navigate('/dashboard');

        } catch (err) {
            console.error(err.message);
            window.alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-8">

                <h1 className="text-3xl font-bold text-white tracking-tight mb-8">
                    Welcome back
                </h1>

                <div className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-slate-900/70 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900/70 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                        onClick={handleLogin}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-3 text-sm shadow-lg mt-2"
                    >
                        Login
                    </button>
                </div>

                <p className="text-slate-400 text-sm text-center mt-6">
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
                    >
                        Register
                    </span>
                </p>

            </div>
        </div>
    );
};

export default Login;