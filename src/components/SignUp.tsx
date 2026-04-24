import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail, FiShield } from "react-icons/fi";
import { isAuthenticated, setAuthCookie } from "../utils/auth-cookie";
import { registerUser, loginUser } from "../data/users";

export default function SignUp() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate("/app", { replace: true });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await registerUser({ emailId: form.email, password: form.password });
      const result = await loginUser({ emailId: form.email, password: form.password });
      setAuthCookie({ email: form.email, userId: result.userId, loggedInAt: new Date().toISOString() }, 7);
      navigate("/app", { replace: true });
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center p-4">

      {/* decorative top arc */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 opacity-[0.09]" />
      <div className="pointer-events-none absolute -top-52 left-1/2 h-[420px] w-[560px] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-teal-400 to-cyan-500 opacity-[0.07]" />

      {/* side accent dots */}
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

        {/* brand */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 inline-flex">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 blur-lg opacity-40" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-3xl shadow-lg">
              🕌
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Salah <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Time</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Your community prayer companion</p>
        </div>

        {/* card */}
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-7 shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_24px_48px_-8px_rgba(13,148,136,0.1),0_0_0_1px_rgba(13,148,136,0.04)]">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Create an account</h2>
            <p className="mt-1 text-sm text-slate-400">Join the community and find prayer times near you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* email */}
            <div className="relative">
              <FiMail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                className="peer h-14 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 pt-4 text-sm text-slate-800 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                required
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400"
              >
                Email address
              </label>
            </div>

            {/* password */}
            <div className="relative">
              <FiLock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                className="peer h-14 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-11 pt-4 text-sm text-slate-800 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                required
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-300 transition hover:bg-slate-100 hover:text-teal-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* confirm password */}
            <div className="relative">
              <FiLock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder=" "
                className="peer h-14 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-11 pt-4 text-sm text-slate-800 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                required
              />
              <label
                htmlFor="confirm"
                className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400"
              >
                Confirm password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-300 transition hover:bg-slate-100 hover:text-teal-600"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                {error}
              </p>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(13,148,136,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(13,148,136,0.5)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {isSubmitting ? "Creating account…" : "Create Account"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-teal-600 transition hover:text-teal-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* secure badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-300">
          <FiShield size={11} />
          <span>Secured · Private · Community-powered</span>
        </div>
      </div>
    </div>
  );
}
