'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';

// Mock credentials
const CREDENTIALS = {
  'admin@eis.com': { password: 'admin123', role: 'ADMIN' },
  'hr@eis.com': { password: 'hr123', role: 'HR' },
  'manager@eis.com': { password: 'manager123', role: 'MANAGER' },
  'employee@eis.com': { password: 'emp123', role: 'EMPLOYEE' },
  'guest@eis.com': { password: 'guest123', role: 'GUEST' }
};

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('login', 'bothFieldsRequired'));
      return;
    }
    const record = CREDENTIALS[email as keyof typeof CREDENTIALS];
    if (!record || record.password !== password) {
      setError(t('login', 'invalidCredentials'));
      return;
    }
    // Success
    setError(null);
    localStorage.setItem('eis_role', record.role);
    localStorage.setItem('eis_email', email);
    router.push('/dashboard');
  };

  const handleFillCredentials = (demoEmail: string) => {
    const demoPassword = CREDENTIALS[demoEmail as keyof typeof CREDENTIALS].password;
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setShowDemoAccounts(false);
  };

  return (
    <div
      className="login-wrapper"
      style={{
        minHeight: '100vh',
        backgroundImage: `url("${process.env.NODE_ENV === 'production' ? '/EIS-Employee-Information-System' : ''}/login-bg.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative'
      }}
    >
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* Injected Premium Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .login-wrapper {
          background-color: #bfdbfe;
          background-blend-mode: overlay;
        }

        .dark .login-wrapper {
          background-color: #0f172a;
          background-blend-mode: multiply;
        }

        .login-card {
          background-color: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          max-width: 400px;
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.6);
          border: none;
          padding: 36px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .dark .login-card {
          background-color: rgba(30, 41, 59, 0.65);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .login-logo {
          background: linear-gradient(135deg, #2563eb, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 4px 0;
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: #334155;
          font-size: 14px;
          text-align: center;
          margin: 0 0 28px 0;
          font-weight: 600;
        }

        .dark .login-subtitle {
          color: #cbd5e1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dark .form-group label {
          color: #94a3b8;
        }

        .form-input {
          background-color: rgba(255, 255, 255, 0.6);
          color: #0f172a;
          height: 44px;
          padding: 10px 14px;
          border: 1.5px solid rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
        }

        .dark .form-input {
          background-color: rgba(15, 23, 42, 0.5);
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .form-input:focus {
          background-color: #ffffff;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
        }

        .dark .form-input:focus {
          background-color: rgba(15, 23, 42, 0.9);
          border-color: #8b5cf6;
        }

        .error-banner {
          background-color: rgba(254, 242, 242, 0.8);
          backdrop-filter: blur(4px);
          border: 1px solid #fee2e2;
          color: #dc2626;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .signin-btn {
          width: 100%;
          height: 46px;
          background: linear-gradient(135deg, #2563eb, #8b5cf6);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;
        }

        .signin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
        }

        /* Demo Accounts Trigger */
        .demo-accounts-trigger {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 24px;
          text-align: center;
          text-decoration: underline;
          transition: color 0.2s;
          user-select: none;
        }

        .dark .demo-accounts-trigger {
          color: #94a3b8;
        }

        .demo-accounts-trigger:hover {
          color: #0f172a;
        }

        .dark .demo-accounts-trigger:hover {
          color: #f8fafc;
        }

        .demo-list {
          margin-top: 12px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          padding: 10px;
          width: 100%;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dark .demo-list {
          border-color: rgba(255, 255, 255, 0.15);
          background-color: rgba(15, 23, 42, 0.4);
        }

        .demo-item {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #475569;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 4px;
          transition: all 0.15s;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .dark .demo-item {
          color: #94a3b8;
        }

        .demo-item:hover {
          border-color: #2563eb;
          color: #2563eb;
          background-color: #eff6ff;
        }

        .dark .demo-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
        }
      ` }} />

      <div className="login-card" style={{ position: 'relative' }}>
        {/* Language Switcher */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '4px' }}>
          <button 
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              background: lang === 'en' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: lang === 'en' ? '#2563eb' : '#94a3b8',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >EN</button>
          <button 
            type="button"
            onClick={() => setLanguage('tr')}
            style={{
              background: lang === 'tr' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: lang === 'tr' ? '#2563eb' : '#94a3b8',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >TR</button>
        </div>

        <h2 className="login-logo">{t('login', 'title')}</h2>
        <p className="login-subtitle">{t('login', 'subtitle')}</p>

        {error && (
          <div className="error-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('login', 'email')}</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="name@eis.com"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">{t('login', 'password')}</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="signin-btn">
            {t('login', 'signIn')}
          </button>
        </form>

        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowDemoAccounts((prev) => !prev);
          }}
          className="demo-accounts-trigger"
          style={{ background: 'transparent', border: 'none', width: '100%', position: 'relative', zIndex: 10, cursor: 'pointer', padding: '10px 0' }}
        >
          {showDemoAccounts ? t('login', 'hideDemo') : t('login', 'showDemo')}
        </button>

        {showDemoAccounts && (
          <div className="demo-list">
            <div className="demo-item" onClick={() => handleFillCredentials('admin@eis.com')}>
              <strong>Admin:</strong> admin@eis.com / admin123
            </div>
            <div className="demo-item" onClick={() => handleFillCredentials('hr@eis.com')}>
              <strong>HR:</strong> hr@eis.com / hr123
            </div>
            <div className="demo-item" onClick={() => handleFillCredentials('manager@eis.com')}>
              <strong>Manager:</strong> manager@eis.com / manager123
            </div>
            <div className="demo-item" onClick={() => handleFillCredentials('employee@eis.com')}>
              <strong>Employee:</strong> employee@eis.com / emp123
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
