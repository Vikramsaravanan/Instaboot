import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'At least 6 characters.';
    if (password !== confirm) errs.confirm = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await register(name, email, password);
    if (ok) navigate('/', { replace: true });
  };

  const inputBase =
    'w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 ' +
    'placeholder-[#6e6b88] text-[#f0eeff] ' +
    'bg-[#1c1c22] border focus:ring-2 focus:ring-violet-500/40';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1030 0%, #0e0e11 65%)' }}
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
           style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-[#2a2a35] bg-[#16161a]/90 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
             style={{ backdropFilter: 'blur(12px)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,58,237,0.5)]"
                 style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}>
              <Zap size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#f0eeff' }}>Create an account</h1>
            <p className="text-sm mt-1" style={{ color: '#6e6b88' }}>Get started with Instaboot</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm border"
                 style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: '#b8b5d0' }}>Full name</label>
              <input id="name" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                className={`${inputBase} ${fieldErrors.name ? 'border-red-500' : 'border-[#2a2a35] focus:border-violet-500'}`} />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#b8b5d0' }}>Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`${inputBase} ${fieldErrors.email ? 'border-red-500' : 'border-[#2a2a35] focus:border-violet-500'}`} />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#b8b5d0' }}>Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                  className={`${inputBase} pr-10 ${fieldErrors.password ? 'border-red-500' : 'border-[#2a2a35] focus:border-violet-500'}`} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6e6b88' }}
                  aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium mb-1.5" style={{ color: '#b8b5d0' }}>Confirm password</label>
              <input id="confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                className={`${inputBase} ${fieldErrors.confirm ? 'border-red-500' : 'border-[#2a2a35] focus:border-violet-500'}`} />
              {fieldErrors.confirm && <p className="mt-1 text-xs text-red-400">{fieldErrors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2.5 text-sm mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UserPlus size={16} />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#6e6b88' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:text-violet-300 transition-colors" style={{ color: '#a78bfa' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
