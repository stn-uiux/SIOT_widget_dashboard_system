import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  UserPlus, 
  LogIn,
  BadgeCheck,
  ShieldAlert,
  Cpu,
  Sparkles
} from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = `${username}@stn.com`;

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        if (password.length < 6) {
          throw new Error('비밀번호는 최소 6자리 이상이어야 합니다.');
        }
        await signUp(email, password, displayName || username);
        await signIn(email, password);
      } else {
        await signIn(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || '인증에 실패했습니다.';
      if (msg === 'Email not confirmed') {
        msg = '이메일 인증이 필요하거나 아직 승인되지 않은 계정입니다.';
      } else if (msg === 'Invalid login credentials') {
        msg = '아이디 또는 비밀번호가 올바르지 않습니다.';
      } else if (msg.includes('User already registered')) {
        msg = '이미 존재하는 아이디입니다.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image (Fixed for maximum clarity) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${new URL('../assets/login-bg.png', import.meta.url).href})`,
        }}
      >
        {/* Subtle Overlays */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="relative inline-block">
            <img 
              src={new URL('../assets/logo-w-1 1.png', import.meta.url).href} 
              alt="STN Logo" 
              className="h-12 w-auto object-contain opacity-90"
            />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <p className="text-red-400 text-sm font-medium leading-tight">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-white/50 text-[10px] font-black uppercase tracking-widest ml-1 mb-2">
                User ID
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within/input:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="사용자 아이디"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-bold"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="block text-white/50 text-[10px] font-black uppercase tracking-widest ml-1 mb-2">
                  Display Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within/input:text-blue-500 transition-colors">
                    <LogIn size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="표시될 이름"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/50 text-[10px] font-black uppercase tracking-widest ml-1 mb-2">
                Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within/input:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자리 이상)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-bold"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-400">
                <label className="block text-white/50 text-[10px] font-black uppercase tracking-widest ml-1 mb-2">
                  Confirm Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within/input:text-blue-500 transition-colors">
                    <ShieldAlert size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSignUp ? '회원가입 완료' : '시스템 로그인'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-white/40 hover:text-blue-400 text-xs font-bold transition-colors uppercase tracking-tight"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '새로운 계정이 필요하신가요? 회원가입'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-white/20 text-[10px] font-medium tracking-tight uppercase">
          &copy; 2026 STN GLOBAL SOLUTIONS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
