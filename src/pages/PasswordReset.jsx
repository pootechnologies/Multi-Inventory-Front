import { Lightbulb, Eye, EyeOff, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  API_BASE_URL_LOGIN,
} from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

const PasswordResetPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const uidParam = searchParams.get("uid");
    const tokenParam = searchParams.get("token");
    
    if (uidParam && tokenParam) {
      setUid(uidParam);
      setToken(tokenParam);
    } else {
      setError("Invalid or expired password reset link.");
    }
  }, [searchParams]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL_LOGIN}tenants/password/reset/confirm/`,
        {
          uid: uid,
          token: token,
          password: password,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccess(true);
      toast.success("Password reset successfully!");
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error confirming password reset:", error);
      setError(error.response?.data?.detail || "Failed to reset password. The link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFF] dark:bg-slate-950">
      {/* Right side: Form Container */}
      <div className="w-full mx-auto lg:w-1/2 flex flex-col justify-between items-center p-6 sm:p-12 relative min-h-screen">
        {/* Invisible spacer to balance the footer and keep the form perfectly centered */}
        <div className="h-4 sm:h-8 shrink-0"></div>

        <div className="w-full max-w-[440px] my-auto space-y-10 py-6 animate-in fade-in slide-in-from-right-4 duration-700">
          {/* Mobile Logo (Visible on Mobile) */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Lightbulb className="text-white h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              PO'O <span className="text-blue-600">Technologies</span>
            </h2>
          </div>

          {/* Password Reset Form View */}
          <div key="password-reset-form" className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                <span>Set New Password</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your new password below.</p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl animate-in slide-in-from-top-2">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                  {error}
                </p>
              </div>
            )}

            {success ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl animate-in slide-in-from-top-2 text-center">
                <Lock className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Password Reset Successful</p>
                <p className="text-emerald-600/70 dark:text-emerald-400/70 text-sm">
                  Your password has been reset. Redirecting to sign in...
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                  <div className="group relative transition-all">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Spinner className="h-5 w-5 border-white dark:border-slate-900" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Reset Password</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="text-center animate-in fade-in duration-300">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-bold hover:underline underline-offset-4"
                >
                  Back to Sign In
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="w-full max-w-[440px] px-6 pt-6 text-center shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; 2026 PO'O TECHNOLOGIES. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;