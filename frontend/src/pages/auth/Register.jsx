import { registerUser } from "../../api/auth";
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
            console.log(response);
            if (!response.status >= 200 && response.status < 300) {
                throw new Error("Registration failed, please try again");
            }
            alert("Registration Successful");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Something went wrong");
        }
    };

    const handleChange = (field, value) => {
        setUser({ ...user, [field]: value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
            >
                <h1 className="text-2xl font-bold text-center text-gray-800">
                    Register
                </h1>

                {/* Full Name */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">
                        Full Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                            handleChange("full_name", e.target.value)
                        }
                        required
                    />
                </div>

                {/* Mobile */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">
                        Mobile Number
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your mobile number"
                        className="mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                            handleChange("mobile_number", e.target.value)
                        }
                        required
                    />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                            handleChange("email", e.target.value)
                        }
                        required
                    />
                </div>

                {/* Aadhaar */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">
                        Aadhaar Number
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your Aadhaar number"
                        className="mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                            handleChange("aadhaar_number", e.target.value)
                        }
                        required
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) =>
                            handleChange("password", e.target.value)
                        }
                        required
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Register
                </button>

                <p className="text-sm text-center text-gray-500">
                    Already have an account?{" "}
                    <span
                        className="text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Register;