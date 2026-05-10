'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="url(#g)" strokeWidth="2.5" />
            <path d="M16 8v10l6 4" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          CrimeWatch
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link href="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link href="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link href="/map" className={isActive('/map') ? 'active' : ''}>Live Map</Link>
          <Link href="/reports" className={isActive('/reports') ? 'active' : ''}>Reports</Link>

          {user && (user.role === 'admin' || user.role === 'authority') && (
            <Link href="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
          )}
          {user && user.role === 'admin' && (
            <Link href="/admin" className={isActive('/admin') ? 'active' : ''}>Admin</Link>
          )}

          {user ? (
            <div className="nav-user">
              <Link href="/report" className="nav-btn-primary">
                + Report Crime
              </Link>
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <div className="nav-avatar" title="My Profile" style={{ cursor: 'pointer' }}>{user.name?.charAt(0).toUpperCase()}</div>
              </Link>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register" className="nav-btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/map" onClick={() => setMenuOpen(false)}>Live Map</Link>
        <Link href="/reports" onClick={() => setMenuOpen(false)}>Reports</Link>
        
        {user ? (
          <>
            { (user.role === 'admin' || user.role === 'authority') && (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            { user.role === 'admin' && (
              <Link href="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
            )}
            <Link href="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
            <Link href="/report" className="nav-btn-primary" onClick={() => setMenuOpen(false)}>+ Report Crime</Link>
            <button onClick={() => { logout(); setMenuOpen(false); }} className="logout-btn">Logout ({user.name})</button>
          </>
        ) : (
          <>
            <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link href="/register" className="nav-btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
