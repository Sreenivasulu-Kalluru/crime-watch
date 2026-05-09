'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join CrimeWatch and help keep your community safe</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Phone (Optional)</label>
            <input type="tel" className="form-control" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={6} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
        </form>
        <div className="auth-footer">Already have an account? <Link href="/login">Sign In</Link></div>
      </div>
    </div>
  );
}
