import { registerUser } from "../api/auth.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        full_name: "",
        mobile_number: "",
        email: "",
        aadhaar_number: "",
        password: "",
        role: "citizen",
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await registerUser(user);

            // ✅ FIXED CONDITION
            if (!(response.status >= 200 && response.status < 300)) {
                throw new Error("Registration failed, please try again");
            }

            alert("Registration Successful");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Something went wrong");
        }
    };

    const handleChange = (field, value) => {
        setUser({ ...user, [field]: value });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-5"
            >
                <h1 className="text-3xl font-bold text-white text-center mb-6">
                    Create Account
                </h1>

                {/* Full Name */}
                <input
                    type="text"
                    placeholder="Full Name"
                    className="input-style"
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    required
                />

                {/* Mobile */}
                <input
                    type="text"
                    placeholder="Mobile Number"
                    className="input-style"
                    onChange={(e) => handleChange("mobile_number", e.target.value)}
                    required
                />

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    className="input-style"
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                />

                {/* Aadhaar */}
                <input
                    type="text"
                    placeholder="Aadhaar Number"
                    className="input-style"
                    onChange={(e) => handleChange("aadhaar_number", e.target.value)}
                    required
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="input-style"
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                />

                {/* Button */}
                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-3 text-sm shadow-lg transition duration-200"
                >
                    Register
                </button>

                {/* Redirect */}
                <p className="text-slate-400 text-sm text-center">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Register;