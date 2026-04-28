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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--login-bg)' }}>
      {/* Background Image (Fixed for maximum clarity) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${new URL('../assets/login-bg.png', import.meta.url).href})`,
        }}
      >
        {/* Subtle Overlays */}
        <div className="absolute inset-0" style={{ backgroundColor: 'black', opacity: 'var(--login-overlay-opacity)' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center" style={{ marginBottom: 'var(--login-logo-margin-bottom)' }}>
          <div className="relative inline-block">
            <img 
              src={new URL('../assets/logo-w-1 1.png', import.meta.url).href} 
              alt="STN Logo" 
              className="h-12 w-auto object-contain opacity-90"
            />
          </div>
        </div>

        <div 
          className="border shadow-2xl overflow-hidden relative group"
          style={{ 
            backgroundColor: 'var(--login-card-bg)', 
            backdropFilter: `blur(var(--login-card-blur))`,
            borderColor: 'var(--login-card-border)',
            borderRadius: 'var(--login-card-radius)',
            padding: 'var(--login-card-padding)',
            boxShadow: 'var(--login-card-shadow)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 'var(--login-input-gap)' }}>
            {error && (
              <div 
                className="border rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2"
                style={{ 
                  backgroundColor: 'var(--login-error-bg)',
                  borderColor: 'var(--login-error-border)'
                }}
              >
                <AlertCircle className="shrink-0 mt-0.5" style={{ color: 'var(--login-error-text)' }} size={18} />
                <p className="text-xs font-bold leading-relaxed" style={{ color: 'var(--login-error-text)' }}>{error}</p>
              </div>
            )}

            <div>
              <label 
                className="block text-[10px] font-black uppercase tracking-widest"
                style={{ 
                  color: 'var(--login-label-color)',
                  marginBottom: 'var(--login-label-margin-bottom)',
                  marginLeft: 'var(--login-label-margin-left)'
                }}
              >
                User ID
              </label>
              <div className="relative group/input">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none group-focus-within/input:text-primary transition-colors"
                  style={{ color: 'var(--login-icon-color)', left: 'var(--login-input-icon-left)' }}
                >
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="사용자 아이디"
                  className="w-full focus:outline-none focus:ring-2 transition-all font-bold"
                  style={{ 
                    backgroundColor: 'var(--login-input-bg)',
                    borderColor: 'var(--login-input-border)',
                    borderWidth: '1px',
                    borderRadius: 'var(--login-input-radius)',
                    paddingTop: 'var(--login-input-padding-y)',
                    paddingBottom: 'var(--login-input-padding-y)',
                    paddingLeft: 'var(--login-input-padding-with-icon)',
                    paddingRight: 'var(--login-input-padding-x)'
                  }}
                />
              </div>
            </div>

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <label 
                  className="block text-[10px] font-black uppercase tracking-widest"
                  style={{ 
                    color: 'var(--login-label-color)',
                    marginBottom: 'var(--login-label-margin-bottom)',
                    marginLeft: 'var(--login-label-margin-left)'
                  }}
                >
                  Display Name
                </label>
                <div className="relative group/input">
                  <div 
                  className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none group-focus-within/input:text-primary transition-colors"
                  style={{ color: 'var(--login-icon-color)', left: 'var(--login-input-icon-left)' }}
                >
                    <LogIn size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="표시될 이름"
                    className="w-full focus:outline-none focus:ring-2 transition-all font-bold"
                    style={{ 
                      backgroundColor: 'var(--login-input-bg)',
                      borderColor: 'var(--login-input-border)',
                      borderWidth: '1px',
                      borderRadius: 'var(--login-input-radius)',
                      paddingTop: 'var(--login-input-padding-y)',
                      paddingBottom: 'var(--login-input-padding-y)',
                      paddingLeft: 'var(--login-input-padding-with-icon)',
                      paddingRight: 'var(--login-input-padding-x)'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label 
                className="block text-[10px] font-black uppercase tracking-widest"
                style={{ 
                  color: 'var(--login-label-color)',
                  marginBottom: 'var(--login-label-margin-bottom)',
                  marginLeft: 'var(--login-label-margin-left)'
                }}
              >
                Password
              </label>
              <div className="relative group/input">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none group-focus-within/input:text-primary transition-colors"
                  style={{ color: 'var(--login-icon-color)', left: 'var(--login-input-icon-left)' }}
                >
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자리 이상)"
                  className="w-full focus:outline-none focus:ring-2 transition-all font-bold"
                  style={{ 
                    backgroundColor: 'var(--login-input-bg)',
                    borderColor: 'var(--login-input-border)',
                    borderWidth: '1px',
                    borderRadius: 'var(--login-input-radius)',
                    paddingTop: 'var(--login-input-padding-y)',
                    paddingBottom: 'var(--login-input-padding-y)',
                    paddingLeft: 'var(--login-input-padding-with-icon)',
                    paddingRight: 'var(--login-input-padding-x)'
                  }}
                />
              </div>
            </div>

            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-400">
                <label 
                  className="block text-[10px] font-black uppercase tracking-widest"
                  style={{ 
                    color: 'var(--login-label-color)',
                    marginBottom: 'var(--login-label-margin-bottom)',
                    marginLeft: 'var(--login-label-margin-left)'
                  }}
                >
                  Confirm Password
                </label>
                <div className="relative group/input">
                  <div 
                  className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none group-focus-within/input:text-primary transition-colors"
                  style={{ color: 'var(--login-icon-color)', left: 'var(--login-input-icon-left)' }}
                >
                    <ShieldAlert size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                    className="w-full focus:outline-none focus:ring-2 transition-all font-bold"
                    style={{ 
                      backgroundColor: 'var(--login-input-bg)',
                      borderColor: 'var(--login-input-border)',
                      borderWidth: '1px',
                      borderRadius: 'var(--login-input-radius)',
                      paddingTop: 'var(--login-input-padding-y)',
                      paddingBottom: 'var(--login-input-padding-y)',
                      paddingLeft: 'var(--login-input-padding-with-icon)',
                      paddingRight: 'var(--login-input-padding-x)'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70"
              style={{ 
                background: 'var(--login-button-gradient)',
                boxShadow: 'var(--login-button-shadow)',
                paddingTop: 'var(--login-input-padding-y)',
                paddingBottom: 'var(--login-input-padding-y)',
                borderRadius: 'var(--login-input-radius)'
              }}
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

          <div className="mt-8 pt-6 border-t border-[var(--login-card-border)] flex justify-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="login-link text-xs font-bold uppercase tracking-tight"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '새로운 계정이 필요하신가요? 회원가입'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center login-footer-text text-[10px] font-medium tracking-tight uppercase">
          &copy; 2026 STN GLOBAL SOLUTIONS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
