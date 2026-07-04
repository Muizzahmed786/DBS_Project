import { registerUser } from "../api/auth.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await registerUser(user);

      if (!(response.status >= 200 && response.status < 300)) {
        throw new Error("Registration failed, please try again");
      }

      toast.success("Registration Successful");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-blue-100 rounded-2xl shadow-xl p-8 space-y-5"
      >
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-6">
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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input-style pr-12"
            onChange={(e) => handleChange("password", e.target.value)}
            required
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

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 text-sm shadow-lg transition duration-200"
        >
          Register
        </button>

        {/* Redirect */}
        <p className="text-slate-500 text-sm text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
