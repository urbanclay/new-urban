
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, ArrowRight, ShieldAlert, CheckCircle, RefreshCcw, Loader2, Info } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<UserType | null>(null);

  // 硬编码的开发者管理员账号
  const ADMIN_EMAIL = 'newmcgraw@gmail.com';
  const ADMIN_PASS = 'Edward0424!';

  const getUsers = (): UserType[] => {
    const data = localStorage.getItem('urbanclay_users');
    return data ? JSON.parse(data) : [];
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // 首先检查是否为硬编码的管理员账号
      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        const adminUser: UserType = {
          id: 'admin_dev_001',
          email: ADMIN_EMAIL,
          name: '开发者管理员',
          is_verified: true
        };
        onLogin(adminUser);
        setLoading(false);
        return;
      }

      // 否则检查本地存储中的用户
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        setError('身份验证失败。请检查邮箱与通行密码，或联系系统架构师。');
        setLoading(false);
        return;
      }

      if (!user.is_verified) {
        setUnverifiedUser(user);
        setMode('verify');
        setLoading(false);
        return;
      }

      onLogin(user);
      setLoading(false);
    }, 1200);
  };

  const handleVerify = () => {
    if (!unverifiedUser) return;
    setLoading(true);
    
    setTimeout(() => {
      const users = getUsers();
      const updatedUsers = users.map(u => 
        u.id === unverifiedUser.id ? { ...u, is_verified: true } : u
      );
      localStorage.setItem('urbanclay_users', JSON.stringify(updatedUsers));
      onLogin({ ...unverifiedUser, is_verified: true });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Tech Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:40px_40px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <ShieldCheck className="text-white" size={28} />
             </div>
             <span className="text-3xl font-black text-white tracking-tighter lowercase">urbanclay</span>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          {mode === 'verify' ? (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                <Mail size={40} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">验证您的身份</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                我们已向 <span className="text-blue-400 font-bold">{email}</span> 发送了验证链接。<br/>
                出于安全考虑，必须完成验证才能访问系统。
              </p>
              
              <button 
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> 我已完成验证</>}
              </button>
              
              <button 
                onClick={() => setMode('login')}
                className="mt-6 text-slate-500 text-xs font-bold hover:text-white transition-colors"
              >
                返回登录
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-2xl">
                <button 
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  系统登录
                </button>
                <button 
                  onClick={() => setMode('register')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  用户注册
                </button>
              </div>

              {mode === 'register' ? (
                <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <ShieldAlert size={32} />
                  </div>
                  <h3 className="text-white font-bold">注册功能暂时关闭</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    为了保障系统数据安全与私密性，当前版本仅支持预设管理员账户访问。如需获取权限，请联系系统所有者。
                  </p>
                  <button 
                    onClick={() => setMode('login')}
                    className="text-blue-400 text-xs font-bold hover:underline"
                  >
                    返回登录页面
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
                      <ShieldAlert size={16} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">管理员邮箱 / Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="email" 
                          required
                          placeholder="admin@urbanclay.tech"
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">通行密码 / Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                      >
                        {loading ? <RefreshCcw className="animate-spin" size={18} /> : (
                          <>
                            身份验证登录
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      端到端加密保护
                    </div>
                    <p className="text-[9px] text-slate-600 max-w-[280px] leading-relaxed font-medium">
                      UrbanClay 核心安全架构已激活。系统会自动拦截非授权的公用请求，并对存储层执行用户级隔离。
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
