
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, Loader2, Chrome, Sparkles, ArrowLeft } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, loginWithEmail, registerWithEmail, resetPassword } = useFirebase();
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (view === 'login') {
        await loginWithEmail(email, password);
        setSuccess("Login successful! Welcome back.");
        setTimeout(onClose, 1500);
      } else if (view === 'signup') {
        await registerWithEmail(email, password, name);
        setSuccess("Account created successfully! Welcome to the Wizard.");
        setTimeout(onClose, 1500);
      } else if (view === 'forgot-password') {
        await resetPassword(email);
        setSuccess("Password reset email sent! Please check your inbox.");
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "Authentication failed";
      if (err.code === 'auth/invalid-credential') {
        message = "Invalid email or password. If you don't have an account, please sign up first.";
      } else if (err.code === 'auth/email-already-in-use') {
        message = "This email is already in use. Please login instead.";
      } else if (err.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters.";
      } else if (err.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login();
      setSuccess("Google login successful!");
      setTimeout(onClose, 1500);
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0d1117] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-[210]"
          >
            {/* Wizard Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-8 border-b border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-4 shadow-xl shadow-cyan-500/10">
                  <Sparkles className="text-cyan-400" size={32} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Join the Wizard' : 'Reset Password'}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  {view === 'login' ? 'Access your repair terminal' : view === 'signup' ? 'Start your diagnostic journey' : 'Recover your access keys'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {view === 'forgot-password' && (
                <button
                  onClick={() => setView('login')}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest mb-6 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </button>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                  >
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                  >
                    <p className="text-xs text-emerald-400 font-medium">{success}</p>
                  </motion.div>
                )}

                {view === 'signup' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {view !== 'forgot-password' && (
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input
                      required
                      type="password"
                      placeholder="Password"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                {view === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-[10px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogIn size={18} />
                  )}
                  <span className="uppercase tracking-widest text-[10px]">
                    {view === 'login' ? 'Login' : view === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                  </span>
                </button>
              </form>

              {view !== 'forgot-password' && (
                <>
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                      <span className="bg-[#0d1117] px-4 text-slate-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    <Chrome size={18} />
                    <span className="uppercase tracking-widest text-[10px]">Google</span>
                  </button>

                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                      className="text-[10px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors"
                    >
                      {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
