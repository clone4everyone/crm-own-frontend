import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchProfile } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  async function submit(e) {
    e.preventDefault();
    const res = await dispatch(loginUser({ email, password }));
    if (res.type.endsWith("fulfilled")) {
      await dispatch(fetchProfile());
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black text-white">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0">
        <div className="w-72 h-72 bg-blue-600 opacity-30 rounded-full animate-blob absolute -top-10 -left-10"></div>
        <div className="w-72 h-72 bg-purple-600 opacity-30 rounded-full animate-blob animation-delay-2000 absolute top-20 right-0"></div>
        <div className="w-72 h-72 bg-pink-600 opacity-30 rounded-full animate-blob animation-delay-4000 absolute bottom-10 left-20"></div>
      </div>

      {/* Glass Card */}
      <form
        onSubmit={submit}
        className="relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 w-[390px] animate-slideUp"
      >
        <h2 className="text-3xl font-bold text-center mb-8 tracking-wide">
          Welcome Back
        </h2>

        {error && (
          <div className="mb-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="text-sm mb-1 block">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/20 focus:border-blue-400 outline-none transition placeholder-gray-300"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-8 relative">
          <label className="text-sm mb-1 block">Password</label>
          <input
            type={showPass ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/20 focus:border-blue-400 outline-none transition placeholder-gray-300"
            placeholder="●●●●●●●"
          />
          <span
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-10 cursor-pointer text-gray-200 hover:text-white"
          >
            {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
          </span>
        </div>

        <button
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        <p className="text-center mt-5 text-sm text-gray-300">
          Don’t have an account?
          <span
            className="text-blue-400 hover:underline cursor-pointer ml-1"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
