import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail, FiShield } from "react-icons/fi";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { isAuthenticated, setAuthCookie } from "../utils/auth-cookie";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/app", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthCookie({ email: form.email, loggedInAt: new Date().toISOString() }, 7);
    navigate("/app", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950 flex items-center justify-center p-4">

      {/* ── decorative top arc ── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 opacity-[0.09]" />
      <div className="pointer-events-none absolute -top-52 left-1/2 h-[420px] w-[560px] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-teal-400 to-cyan-500 opacity-[0.07]" />

      {/* ── side accent dots ── */}
      <div className="pointer-events-none absolute bottom-16 left-6 grid grid-cols-4 gap-2 opacity-[0.12]">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-teal-500" />
        ))}
      </div>
      <div className="pointer-events-none absolute top-16 right-6 grid grid-cols-4 gap-2 opacity-[0.12]">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-cyan-500" />
        ))}
      </div>

      <div className="relative w-full max-w-sm">

        {/* ── brand ── */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 inline-flex">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 blur-lg opacity-40" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-3xl shadow-lg">
              🕌
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Salah <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Time</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Your community prayer companion</p>
        </div>

        {/* ── card ── */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900 px-6 py-7 shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_24px_48px_-8px_rgba(13,148,136,0.1),0_0_0_1px_rgba(13,148,136,0.04)]">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome back 👋</h2>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Sign in to access prayer times near you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* email — floating label */}
            <div className="relative">
              <FiMail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 transition peer-focus:text-teal-500" />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                className="peer h-14 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 pl-10 pr-4 pt-4 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/50"
                required
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400"
              >
                Email address
              </label>
            </div>

            {/* password — floating label */}
            <div className="relative">
              <FiLock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                className="peer h-14 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 pl-10 pr-11 pt-4 text-sm text-slate-800 dark:text-slate-100 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/50"
                required
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-300 dark:text-slate-600 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* remember + forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-slate-500 dark:text-slate-400 select-none">
                <input type="checkbox" className="accent-teal-500" />
                Remember me
              </label>
              <a href="#" className="font-semibold text-teal-600 transition hover:text-teal-500">
                Forgot password?
              </a>
            </div>

            {/* submit */}
            <button
              type="submit"
              className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(13,148,136,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(13,148,136,0.5)] active:translate-y-0"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </button>
          </form>

          {/* divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-300 dark:text-slate-600">or</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
          </div>

          {/* social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="group flex h-11 items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md active:translate-y-0 active:scale-95"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 transition group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20">
                <FaGoogle size={11} className="text-slate-400 transition group-hover:text-rose-400" />
              </span>
              Google
            </button>
            <button
              type="button"
              className="group flex h-11 items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md active:translate-y-0 active:scale-95"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 transition group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                <FaFacebook size={12} className="text-slate-400 transition group-hover:text-blue-400" />
              </span>
              Facebook
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
            Don't have an account?{" "}
            <a href="#" className="font-semibold text-teal-600 transition hover:text-teal-500">
              Sign up
            </a>
          </p>
        </div>

        {/* secure badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-300 dark:text-slate-600">
          <FiShield size={11} />
          <span>Secured · Private · Community-powered</span>
        </div>
      </div>
    </div>
  );
}
