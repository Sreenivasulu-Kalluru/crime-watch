'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your CrimeWatch account</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="auth-footer">Don&apos;t have an account? <Link href="/register">Sign Up</Link></div>
      </div>
    </div>
  );
}
