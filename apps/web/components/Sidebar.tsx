'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';

type SidebarProps = {
  role: string;
  currentPath: string;
};

const translateRole = (role: string, lang: string) => {
  if (lang !== 'tr') return role;
  if (role === 'EMPLOYEE') return 'ÇALIŞAN';
  if (role === 'MANAGER') return 'YÖNETİCİ';
  if (role === 'HR') return 'İK';
  if (role === 'ADMIN') return 'SİSTEM YÖNETİCİSİ';
  return role;
};

const getTranslationKey = (label: string): string => {
  const map: Record<string, string> = {
    'Dashboard': 'dashboard',
    'Organization': 'organization',
    'Users': 'users',
    'Audit Logs': 'auditLogs',
    'Leave Types': 'leaveTypes',
    'Leave History': 'leaveHistory',
    'New Request': 'leaveRequest',
    'New Leave Request': 'leaveRequest',
    'Notifications': 'notifications',
    'Employees': 'employees',
    'HR Approvals': 'approvals',
    'Approvals': 'approvals',
  };
  return map[label] || label;
};

const navConfig: Record<string, { label: string; href: string }[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Organization', href: '/admin/organization' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Audit Logs', href: '/admin/audit-logs' },
    { label: 'Leave Types', href: '/admin/leave-types' },
    { label: 'Leave History', href: '/leave/history' },
    { label: 'New Request', href: '/leave/new' },
    { label: 'Notifications', href: '/notifications' },
  ],
  HR: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Employees', href: '/hr/employees' },
    { label: 'HR Approvals', href: '/hr/approvals' },
    { label: 'Leave History', href: '/leave/history' },
    { label: 'New Request', href: '/leave/new' },
    { label: 'Notifications', href: '/notifications' },
  ],
  MANAGER: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Approvals', href: '/manager/approvals' },
    { label: 'Leave History', href: '/leave/history' },
    { label: 'New Request', href: '/leave/new' },
    { label: 'Notifications', href: '/notifications' },
  ],
  EMPLOYEE: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'New Leave Request', href: '/leave/new' },
    { label: 'Leave History', href: '/leave/history' },
    { label: 'Notifications', href: '/notifications' },
  ],
};

const iconMap: Record<string, React.ReactNode> = {
  'Dashboard': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  'Organization': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"></path>
      <rect x="9" y="2" width="6" height="6" rx="1"></rect>
      <rect x="2" y="16" width="6" height="6" rx="1"></rect>
      <rect x="16" y="16" width="6" height="6" rx="1"></rect>
      <path d="M12 8v4"></path>
      <path d="M5 12h14v4"></path>
    </svg>
  ),
  'Users': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  'Employees': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
  ),
  'Audit Logs': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  'Leave Types': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
  ),
  'Leave History': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  'New Request': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  'New Leave Request': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  'Approvals': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  'HR Approvals': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  'Notifications': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
};

export default function Sidebar({ role, currentPath }: SidebarProps) {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();
  const items = navConfig[role] || [];
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const checkUnread = () => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('eis_email');
      const saved = localStorage.getItem('eis_notifications');
      if (saved && email) {
        try {
          const list = JSON.parse(saved);
          const unread = list.filter((n: any) => n.email.toLowerCase() === email.toLowerCase() && !n.read).length;
          setUnreadCount(unread);
        } catch (e) {
          console.error(e);
        }
      } else {
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    checkUnread();
    
    window.addEventListener('storage', checkUnread);
    window.addEventListener('eis_notification_update', checkUnread);
    
    return () => {
      window.removeEventListener('storage', checkUnread);
      window.removeEventListener('eis_notification_update', checkUnread);
    };
  }, [currentPath]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eis_role');
      localStorage.removeItem('eis_email');
    }
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-[#1e3a5f] text-white p-4 sticky top-0 z-40 shadow-md w-full">
        <div className="font-extrabold text-xl tracking-tight flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          EIS
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#1e3a5f] text-white py-8 flex flex-col justify-between shrink-0 shadow-xl border-r border-[#152a45] w-[250px] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div>
          {/* Logo and Role Badge */}
          <div className="px-6 mb-10 flex justify-between items-start">
            <div>
              <div className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                EIS
              </div>
              <div className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide bg-blue-500/15 text-blue-300 px-3 py-1 rounded-full border border-blue-500/25">
                {translateRole(role, lang)} {t('sidebar', 'portal')}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white bg-white/5 rounded-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            // Remove trailing slash for exact matching, except for root '/'
            const normalizedCurrentPath = currentPath.endsWith('/') && currentPath.length > 1 
              ? currentPath.slice(0, -1) 
              : currentPath;
            const isActive = normalizedCurrentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 px-5 rounded-lg mx-4 text-sm transition-all duration-200 border-l-4 ${
                  isActive 
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30 border-blue-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1 font-medium border-transparent'
                }`}
              >
                {iconMap[item.label] || (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                )}
                <span>{t('sidebar', getTranslationKey(item.label))}</span>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: 'auto',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold rounded-lg mx-4 w-[calc(100%-32px)] py-3 text-sm cursor-pointer transition-all duration-200 shadow-md shadow-red-600/20 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>{t('sidebar', 'logout')}</span>
        </button>

        {/* Controls Container */}
        <div className="flex items-center justify-between px-6 mt-6">
          <ThemeToggle />
          
          <div className="flex gap-2">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                lang === 'en' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-400 border border-transparent hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('tr')}
              className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                lang === 'tr' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-400 border border-transparent hover:text-slate-200'
              }`}
            >
              TR
            </button>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
