import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMail, FiShield } from "react-icons/fi";
import { sendOtp, verifyOtp, resetPassword } from "../data/users";

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  function startResendCooldown() {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function handleSendOtp(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      //await sendOtp(email);
      setStep("otp");
      startResendCooldown();
    } catch {
      setError("Unable to send OTP. Please check your email and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      //await verifyOtp(email, otp);
      setStep("password");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg === "invalid" ? "Incorrect OTP. Please try again." : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      await sendOtp(email);
      startResendCooldown();
    } catch {
      setError("Unable to resend OTP. Please try again.");
    }
  }

  async function handleResetPassword(e: { preventDefault(): void }) {
    e.preventDefault();
    if (passwords.password !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(email, passwords.password);
      setStep("success");
    } catch {
      setError("Unable to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center p-4">

      {/* decorative arcs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 opacity-[0.09]" />
      <div className="pointer-events-none absolute -top-52 left-1/2 h-[420px] w-[560px] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-teal-400 to-cyan-500 opacity-[0.07]" />
      <div className="pointer-events-none absolute bottom-16 left-6 grid grid-cols-4 gap-2 opacity-[0.12]">
        {Array.from({ length: 24 }).map((_, i) => <div key={i} className="h-1 w-1 rounded-full bg-teal-500" />)}
      </div>
      <div className="pointer-events-none absolute top-16 right-6 grid grid-cols-4 gap-2 opacity-[0.12]">
        {Array.from({ length: 24 }).map((_, i) => <div key={i} className="h-1 w-1 rounded-full bg-cyan-500" />)}
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

        {/* progress dots */}
        {step !== "success" && (
          <div className="mb-4 flex items-center justify-center gap-2">
            {(["email", "otp", "password"] as Step[]).map((s, i) => {
              const steps: Step[] = ["email", "otp", "password"];
              const current = steps.indexOf(step);
              const done = i < current;
              const active = i === current;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${active ? "w-6 bg-teal-500" : done ? "w-2 bg-teal-400" : "w-2 bg-slate-200"}`} />
                </div>
              );
            })}
          </div>
        )}

        {/* card */}
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-7 shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_24px_48px_-8px_rgba(13,148,136,0.1),0_0_0_1px_rgba(13,148,136,0.04)]">

          {/* ── step 1: email ── */}
          {step === "email" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Reset your password</h2>
                <p className="mt-1 text-sm text-slate-400">We'll send a one-time code to your email address.</p>
              </div>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <FiMail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                    placeholder=" "
                    className="peer h-14 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 pt-4 text-sm text-slate-800 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                    required
                  />
                  <label className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400">
                    Email address
                  </label>
                </div>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(13,148,136,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(13,148,136,0.5)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                    {isSubmitting ? "Sending…" : "Send OTP"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </button>
              </form>
            </>
          )}

          {/* ── step 2: otp ── */}
          {step === "otp" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Enter the OTP</h2>
                <p className="mt-1 text-sm text-slate-400">
                  A 6-digit code was sent to <span className="font-semibold text-slate-600">{email}</span>.
                </p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); if (error) setError(null); }}
                  placeholder="000000"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-center text-2xl font-bold tracking-[0.4em] text-slate-800 outline-none transition placeholder:text-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  required
                />
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting || otp.length < 6}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(13,148,136,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(13,148,136,0.5)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                    {isSubmitting ? "Verifying…" : "Verify OTP"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(null); }} className="flex items-center gap-1 text-slate-400 transition hover:text-slate-600">
                    <FiArrowLeft size={12} /> Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="font-semibold text-teal-600 transition hover:text-teal-500 disabled:text-slate-300 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── step 3: new password ── */}
          {step === "password" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Set a new password</h2>
                <p className="mt-1 text-sm text-slate-400">Choose a strong password for your account.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <FiLock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.password}
                    onChange={(e) => { setPasswords((p) => ({ ...p, password: e.target.value })); if (error) setError(null); }}
                    placeholder=" "
                    className="peer h-14 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-11 pt-4 text-sm text-slate-800 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                    required
                  />
                  <label className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400">
                    New password
                  </label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-300 transition hover:bg-slate-100 hover:text-teal-600" aria-label="Toggle password">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <FiLock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => { setPasswords((p) => ({ ...p, confirm: e.target.value })); if (error) setError(null); }}
                    placeholder=" "
                    className="peer h-14 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-11 pt-4 text-sm text-slate-800 outline-none transition placeholder-transparent focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                    required
                  />
                  <label className="pointer-events-none absolute left-10 top-4 text-sm text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-500 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider peer-not-placeholder-shown:text-slate-400">
                    Confirm password
                  </label>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-300 transition hover:bg-slate-100 hover:text-teal-600" aria-label="Toggle password">
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(13,148,136,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(13,148,136,0.5)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                    {isSubmitting ? "Saving…" : "Save Password"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </button>
              </form>
            </>
          )}

          {/* ── step 4: success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-cyan-50 ring-4 ring-teal-100">
                <FiCheckCircle size={32} className="text-teal-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Password reset successfully</h2>
              <p className="mt-2 text-sm text-slate-400">Your password has been updated. You can now sign in with your new password.</p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(13,148,136,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(13,148,136,0.5)] active:translate-y-0"
              >
                Back to Sign In
              </Link>
            </div>
          )}

          {step !== "success" && (
            <p className="mt-5 text-center text-xs text-slate-400">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-teal-600 transition hover:text-teal-500">Sign in</Link>
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-300">
          <FiShield size={11} />
          <span>Secured · Private · Community-powered</span>
        </div>
      </div>
    </div>
  );
}
