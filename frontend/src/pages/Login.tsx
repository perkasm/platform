import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft, Mail, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

// ─── Floating card shape ─────────────────────────────────────────────────────
interface CardShapeProps {
  gradient: string;
  width: number;
  height: number;
  x: number | string;
  y: number | string;
  rotate: number;
  delay: number;
  opacity?: number;
}

const CardShape = ({ gradient, width, height, x, y, rotate, delay, opacity = 0.7 }: CardShapeProps) => (
  <motion.div
    className="absolute rounded-2xl pointer-events-none select-none"
    style={{
      width,
      height,
      background: gradient,
      left: x,
      top: y,
      rotate,
      opacity,
      boxShadow: "0 20px 60px rgba(79,70,229,0.25)",
    }}
    animate={{
      y: [0, -20, 0],
      rotate: [rotate, rotate + 5, rotate],
    }}
    transition={{
      duration: 7 + delay,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  >
    {/* Chip */}
    <div
      className="absolute rounded-md bg-white/30"
      style={{ top: "22%", left: "10%", width: "15%", height: "17%" }}
    />
    {/* Shimmer line */}
    <div
      className="absolute bg-white/10 rounded-full"
      style={{ bottom: "28%", left: "10%", right: "40%", height: "3px" }}
    />
    <div
      className="absolute bg-white/8 rounded-full"
      style={{ bottom: "20%", left: "10%", right: "55%", height: "3px" }}
    />
    {/* Network circles */}
    <div className="absolute flex" style={{ bottom: "14%", right: "8%" }}>
      <div className="w-6 h-6 rounded-full bg-white/40" />
      <div className="w-6 h-6 rounded-full bg-white/25 -ml-3" />
    </div>
  </motion.div>
);

// ─── Google OAuth helper ──────────────────────────────────────────────────────
const buildGoogleAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = "openid profile email";
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
};

// ─── Main component ───────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choice" | "email">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTab, setEmailTab] = useState<"signin" | "signup">("signup");

  const handleGoogleLogin = () => {
    window.location.href = buildGoogleAuthUrl();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050d1f 0%, #071530 55%, #040d1c 100%)" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-blue-700/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-700/15 blur-[100px]" />
      </div>

      {/* Floating credit card shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <CardShape
          gradient="linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
          width={280}
          height={175}
          x="-80px"
          y="10%"
          rotate={-22}
          delay={0}
          opacity={0.6}
        />
        <CardShape
          gradient="linear-gradient(135deg, #1e40af 0%, #3730a3 100%)"
          width={240}
          height={150}
          x="calc(100% - 200px)"
          y="8%"
          rotate={18}
          delay={1.5}
          opacity={0.5}
        />
        <CardShape
          gradient="linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)"
          width={220}
          height={138}
          x="-60px"
          y="60%"
          rotate={15}
          delay={2.5}
          opacity={0.45}
        />
        <CardShape
          gradient="linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
          width={200}
          height={125}
          x="calc(100% - 170px)"
          y="62%"
          rotate={-14}
          delay={1}
          opacity={0.4}
        />
        <CardShape
          gradient="linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
          width={160}
          height={100}
          x="10%"
          y="85%"
          rotate={8}
          delay={3}
          opacity={0.3}
        />
        <CardShape
          gradient="linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)"
          width={140}
          height={88}
          x="75%"
          y="82%"
          rotate={-20}
          delay={2}
          opacity={0.3}
        />
      </div>

      {/* Back to landing */}
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-indigo-400 hover:text-white text-sm transition-colors z-10"
        whileHover={{ x: -3 }}
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>

      {/* Auth card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-3xl p-8 border border-indigo-700/30 backdrop-blur-xl"
          style={{ background: "rgba(13, 19, 64, 0.85)" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mb-4 shadow-xl shadow-blue-600/30">
              <Sparkles size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Perkasm</h1>
            <p className="text-indigo-300 text-sm mt-1">Maximize every swipe</p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-center text-indigo-300/80 text-sm mb-6">
                  Sign up or sign in to start optimizing your rewards
                </p>

                {/* Google button */}
                <motion.button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-indigo-700/50 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 hover:border-indigo-500/60 transition-all mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FcGoogle size={20} />
                  Continue with Google
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-indigo-900/60" />
                  <span className="text-indigo-500 text-xs font-medium">or</span>
                  <div className="flex-1 h-px bg-indigo-900/60" />
                </div>

                {/* Email button */}
                <motion.button
                  onClick={() => setMode("email")}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-indigo-700/50 bg-indigo-950/40 text-white text-sm font-semibold hover:bg-indigo-900/40 hover:border-indigo-500/60 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail size={18} className="text-indigo-400" />
                  Continue with Email
                  <ArrowRight size={15} className="text-indigo-500 ml-auto" />
                </motion.button>

                <p className="text-center text-xs text-indigo-500 mt-6 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <span className="text-indigo-400 hover:text-white cursor-pointer transition-colors">Terms</span>
                  {" "}and{" "}
                  <span className="text-indigo-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                </p>
              </motion.div>
            )}

            {mode === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Sign in / Sign up tabs */}
                <div className="flex rounded-xl bg-indigo-950/60 border border-indigo-900/40 p-1 mb-6">
                  {(["signup", "signin"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEmailTab(tab)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                        emailTab === tab
                          ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md"
                          : "text-indigo-400 hover:text-white"
                      }`}
                    >
                      {tab === "signup" ? "Sign Up" : "Sign In"}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Email auth coming soon — route to Google for now
                    handleGoogleLogin();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-indigo-300 text-xs font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-white placeholder-indigo-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-300 text-xs font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-white placeholder-indigo-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {emailTab === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <div className="py-2 px-3 rounded-xl bg-indigo-900/30 border border-indigo-700/30 text-indigo-400 text-xs">
                        Email sign up is coming soon. For now, you'll be signed in via Google.
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-shadow mt-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {emailTab === "signup" ? "Create Account" : "Sign In"}
                  </motion.button>
                </form>

                <button
                  onClick={() => setMode("choice")}
                  className="w-full mt-5 text-center text-indigo-500 hover:text-indigo-300 text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={12} />
                  Back to all sign-in options
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
