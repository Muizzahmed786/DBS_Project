import { useState, useEffect } from "react";
import { getCurrentUser, loginUser } from "../api/auth.js";
import { useAuth } from "../context/useAuth.js";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import {Eye,EyeOff} from "lucide-react";
const Login = () => {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await loginUser({ email, password });
      console.log("Login response:", response);

      const userRes = await getCurrentUser();
      console.log("getCurrentUser response:", userRes);

      const user = userRes.data.data[0];
      console.log("User object:", user);
      console.log("User role:", user?.role);

      setUser(user);
      toast.success("Login Successfull");
      const role = user?.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "citizen") navigate("/citizen/dashboard");
      else if (role === "officer") navigate("/officer/dashboard");
      else navigate("/");
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response?.data);
      toast.error("Login Failed");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (user?.role === "citizen") {
      navigate("/citizen/dashboard", { replace: true });
    } else if (user?.role === "officer") {
      navigate("/officer/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-blue-100 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-6">
          Welcome Back
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white text-slate-800 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 text-sm shadow-lg mt-2 transition duration-200"
          >
            Login
          </button>
        </div>

        <p className="text-slate-500 text-sm text-center mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
