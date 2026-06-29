'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { useLanguage } from '../../context/LanguageContext';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  department: string;
  status: 'Active' | 'Inactive';
}

interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  start: string;
  end: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  // Dynamic counts state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDepts: 0,
    orgNodes: 0,
    hrPending: 0,
    managerPending: 0,
    employeeLeaveBalance: 14,
    employeePending: 0,
    employeeApproved: 0,
    teamMembersCount: 0,
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('eis_role');
    const storedEmail = localStorage.getItem('eis_email');
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
      setEmail(storedEmail);
    }
  }, [router]);

  useEffect(() => {
    if (role && email && typeof window !== 'undefined') {
      // 1. Get current user's name
      let activeName = email.split('@')[0];
      const savedUsers = localStorage.getItem('eis_users');
      let usersList: UserRow[] = [];
      if (savedUsers) {
        try {
          usersList = JSON.parse(savedUsers);
          const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (found) {
            activeName = found.name;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setName(activeName);

      // 2. Load stats from localStorage
      // A. Users & Departments
      const userCount = usersList.length;
      const deptCount = new Set(usersList.map(u => u.department).filter(Boolean)).size;

      // B. Org nodes count
      let orgCount = 5; // default fallback
      const savedOrg = localStorage.getItem('eis_org_tree');
      if (savedOrg) {
        try {
          const parsedOrg = JSON.parse(savedOrg);
          const countNodes = (node: any): number => {
            if (!node) return 0;
            let sum = 1;
            if (node.children && node.children.length > 0) {
              node.children.forEach((child: any) => {
                sum += countNodes(child);
              });
            }
            return sum;
          };
          orgCount = countNodes(parsedOrg);
        } catch (e) {
          console.error(e);
        }
      }

      // C. HR Approvals Pending
      let hrPendCount = 0;
      const hrSaved = localStorage.getItem('eis_hr_approvals');
      if (hrSaved) {
        try {
          const hrQueue: LeaveRequest[] = JSON.parse(hrSaved);
          hrPendCount = hrQueue.filter(r => r.status === 'pending').length;
        } catch (e) {
          console.error(e);
        }
      }

      // D. Manager Approvals Pending
      let mgrPendCount = 0;
      const mgrSaved = localStorage.getItem('eis_manager_approvals');
      if (mgrSaved) {
        try {
          const mgrQueue: LeaveRequest[] = JSON.parse(mgrSaved);
          mgrPendCount = mgrQueue.filter(r => r.status === 'pending').length;
        } catch (e) {
          console.error(e);
        }
      }

      // E. Employee Leave Balance & requests matching name
      let empBalance = 14;
      const leavesSaved = localStorage.getItem('eis_employee_leaves');
      if (leavesSaved) {
        try {
          const leavesMap = JSON.parse(leavesSaved);
          const activeUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (activeUser && leavesMap[activeUser.id] !== undefined) {
            empBalance = leavesMap[activeUser.id];
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Find requests for this employee in both HR and Manager queues
      let empPend = 0;
      let empApp = 0;
      const checkEmpRequests = (queue: LeaveRequest[]) => {
        queue.forEach(r => {
          if (r.employee.toLowerCase() === activeName.toLowerCase() || r.employee.toLowerCase() === email.toLowerCase().split('@')[0]) {
            if (r.status === 'pending') empPend++;
            else if (r.status === 'approved') empApp++;
          }
        });
      };
      
      const hrQ = hrSaved ? JSON.parse(hrSaved) : [];
      const mgrQ = mgrSaved ? JSON.parse(mgrSaved) : [];
      checkEmpRequests(hrQ);
      checkEmpRequests(mgrQ);

      // F. Team members count for manager (same department)
      let teamMembers = 0;
      const managerUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (managerUser && managerUser.department) {
        teamMembers = usersList.filter(u => u.department === managerUser.department && u.role !== 'MANAGER').length;
      }

      setStats({
        totalUsers: userCount || 4,
        activeDepts: deptCount || 2,
        orgNodes: orgCount,
        hrPending: hrPendCount,
        managerPending: mgrPendCount,
        employeeLeaveBalance: empBalance,
        employeePending: empPend,
        employeeApproved: empApp,
        teamMembersCount: teamMembers
      });
      setLoaded(true);
    }
  }, [role, email]);

  if (!role || !loaded) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar role={role || 'EMPLOYEE'} currentPath="/dashboard" />
        <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden">
          <div className="skeleton-box" style={{ width: '400px', height: '140px', marginBottom: '32px' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px', maxWidth: '1100px' }}>
            <div className="skeleton-box" style={{ height: '100px' }}></div>
            <div className="skeleton-box" style={{ height: '100px' }}></div>
            <div className="skeleton-box" style={{ height: '100px' }}></div>
          </div>
          <div className="section-container">
            <div className="skeleton-box" style={{ height: '300px' }}></div>
            <div className="skeleton-box" style={{ height: '300px' }}></div>
          </div>
        </main>
      </div>
    );
  }

  const dateString = new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getTranslatedName = (n: string) => {
    if (lang !== 'tr') return n;
    if (n === 'Employee User') return 'Çalışan Kullanıcı';
    if (n === 'Manager User') return 'Yönetici Kullanıcı';
    if (n === 'HR User') return 'İK Kullanıcısı';
    if (n === 'Admin User') return 'Sistem Yöneticisi';
    return n;
  };

  const translateRole = (r: string) => {
    if (lang !== 'tr') return r;
    if (r === 'EMPLOYEE') return 'ÇALIŞAN';
    if (r === 'MANAGER') return 'YÖNETİCİ';
    if (r === 'HR') return 'İK';
    if (r === 'ADMIN') return 'SİSTEM YÖNETİCİSİ';
    return r;
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return lang === 'tr' ? 'Günaydın' : 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return lang === 'tr' ? 'İyi günler' : 'Good afternoon';
    } else if (hour >= 18 && hour < 22) {
      return lang === 'tr' ? 'İyi akşamlar' : 'Good evening';
    } else {
      return lang === 'tr' ? 'İyi geceler' : 'Good night';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar role={role} currentPath="/dashboard" />

      {/* Premium Dashboard CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .welcome-card {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          color: #ffffff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.15), 0 8px 10px -6px rgba(30, 58, 138, 0.1);
          margin-bottom: 32px;
          max-width: 1100px;
          position: relative;
          overflow: hidden;
        }

        .welcome-card::after {
          content: '';
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          top: -100px;
          right: -50px;
        }

        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .welcome-sub {
          font-size: 14px;
          color: #bfdbfe;
          margin-top: 6px;
        }

        .role-pill {
          display: inline-block;
          margin-top: 12px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dark .dashboard-card, .dark .actions-panel, .dark .activity-panel {
          --card-bg: #1e293b;
          --card-border: #334155;
        }

        .dark .action-link {
          --link-bg: #0f172a;
          --link-text: #cbd5e1;
        }

        .dark .panel-title, .dark .card-value {
          color: #f8fafc;
        }

        .dark .card-label, .dark .activity-item {
          color: #94a3b8;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
          max-width: 1100px;
        }

        .dashboard-card {
          background-color: var(--card-bg, #ffffff);
          border-radius: 14px;
          border: 1px solid var(--card-border, #e2e8f0);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005);
          transition: all 0.2s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
        }

        .card-icon-container {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-info {
          display: flex;
          flex-direction: column;
        }

        .card-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .card-value {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }

        .section-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          max-width: 1100px;
        }

        @media (max-width: 820px) {
          .section-container {
            grid-template-columns: 1fr;
          }
        }

        .actions-panel, .activity-panel {
          background-color: var(--card-bg, #ffffff);
          border-radius: 14px;
          border: 1px solid var(--card-border, #e2e8f0);
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005);
        }

        .panel-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main, #1f2937);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background-color: var(--link-bg, #f8fafc);
          border: 1px solid var(--card-border, #e2e8f0);
          border-radius: 10px;
          color: var(--link-text, #334155);
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .action-link:hover {
          background-color: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
          transform: translateX(4px);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          font-size: 13.5px;
          color: #475569;
          line-height: 1.4;
        }

        .activity-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
          margin-top: 5px;
          flex-shrink: 0;
        }
      ` }} />

      <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden text-slate-900 dark:text-slate-100 page-animate">
        {/* Welcome Banner */}
        <div className="welcome-card">
          <h2 className="welcome-title">{getTimeBasedGreeting()}, {getTranslatedName(name || email || '')}!</h2>
          <div className="welcome-sub">{dateString}</div>
          <span className="role-pill">{translateRole(role)} {t('sidebar', 'portal')}</span>
        </div>

        {/* Dynamic Metric Cards based on Role */}
        <div className="dashboard-grid">
          {role === 'ADMIN' && (
            <>
              <div className="dashboard-card" onClick={() => router.push('/admin/users')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'totalUsers')}</span>
                  <span className="card-value">{stats.totalUsers} {t('dashboard', 'members')}</span>
                </div>
              </div>

              <div className="dashboard-card" onClick={() => router.push('/admin/organization')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'orgNodes')}</span>
                  <span className="card-value">{stats.orgNodes} {t('dashboard', 'nodes')}</span>
                </div>
              </div>

              <div className="dashboard-card" onClick={() => router.push('/admin/audit-logs')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'auditLogs')}</span>
                  <span className="card-value">{t('dashboard', 'activeTrack')}</span>
                </div>
              </div>
            </>
          )}

          {role === 'HR' && (
            <>
              <div className="dashboard-card" onClick={() => router.push('/hr/approvals')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'pendingHrApprovals')}</span>
                  <span className="card-value">{stats.hrPending} {t('dashboard', 'requests')}</span>
                </div>
              </div>

              <div className="dashboard-card" onClick={() => router.push('/hr/employees')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'totalEmployees')}</span>
                  <span className="card-value">{stats.totalUsers} {t('dashboard', 'active')}</span>
                </div>
              </div>

              <div className="dashboard-card" style={{ cursor: 'default' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'companyDepts')}</span>
                  <span className="card-value">{stats.activeDepts} {t('dashboard', 'teams')}</span>
                </div>
              </div>
            </>
          )}

          {role === 'MANAGER' && (
            <>
              <div className="dashboard-card" onClick={() => router.push('/manager/approvals')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'pendingTeamApprovals')}</span>
                  <span className="card-value">{stats.managerPending} {t('dashboard', 'leaves')}</span>
                </div>
              </div>

              <div className="dashboard-card" style={{ cursor: 'default' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'directTeamMembers')}</span>
                  <span className="card-value">{stats.teamMembersCount} {t('dashboard', 'employeesCount')}</span>
                </div>
              </div>

              <div className="dashboard-card" onClick={() => router.push('/leave/history')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'approvedOps')}</span>
                  <span className="card-value">{t('dashboard', 'historyQueue')}</span>
                </div>
              </div>
            </>
          )}

          {role === 'EMPLOYEE' && (
            <>
              <div className="dashboard-card" onClick={() => router.push('/leave/new')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'myLeaveBalance')}</span>
                  <span className="card-value">{stats.employeeLeaveBalance} {t('dashboard', 'daysLeft')}</span>
                </div>
              </div>

              <div className="dashboard-card" onClick={() => router.push('/leave/history')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'myPendingLeaves')}</span>
                  <span className="card-value">{stats.employeePending} {t('dashboard', 'requests')}</span>
                </div>
              </div>

              <div className="dashboard-card" onClick={() => router.push('/leave/history')} style={{ cursor: 'pointer' }}>
                <div className="card-icon-container" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="card-info">
                  <span className="card-label">{t('dashboard', 'myApprovedLeaves')}</span>
                  <span className="card-value">{stats.employeeApproved} {t('dashboard', 'requests')}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions & Activity Details */}
        <div className="section-container">
          {/* Quick Actions Card */}
          <div className="actions-panel">
            <h3 className="panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {t('dashboard', 'quickActionCenter')}
            </h3>
            <div className="actions-list">
              {role === 'ADMIN' && (
                <>
                  <a href="/admin/users" className="action-link">
                    <span>{t('dashboard', 'manageUserAccounts')}</span>
                    <span>➔</span>
                  </a>
                  <a href="/admin/organization" className="action-link">
                    <span>{t('dashboard', 'updateOrgChart')}</span>
                    <span>➔</span>
                  </a>
                  <a href="/admin/audit-logs" className="action-link">
                    <span>{t('dashboard', 'reviewAuditLogs')}</span>
                    <span>➔</span>
                  </a>
                </>
              )}

              {role === 'HR' && (
                <>
                  <a href="/hr/approvals" className="action-link">
                    <span>{t('dashboard', 'processLeaveQueue')}</span>
                    <span>➔</span>
                  </a>
                  <a href="/hr/employees" className="action-link">
                    <span>{t('dashboard', 'viewEmpDb')}</span>
                    <span>➔</span>
                  </a>
                  <a href="/leave/history" className="action-link">
                    <span>{t('dashboard', 'leaveHistoryLog')}</span>
                    <span>➔</span>
                  </a>
                </>
              )}

              {role === 'MANAGER' && (
                <>
                  <a href="/manager/approvals" className="action-link">
                    <span>{t('dashboard', 'processTeamQueue')}</span>
                    <span>➔</span>
                  </a>
                  <a href="/leave/new" className="action-link">
                    <span>{t('dashboard', 'submitPersonalLeave')}</span>
                    <span>➔</span>
                  </a>
                  <a href="/leave/history" className="action-link">
                    <span>{t('dashboard', 'leaveHistoryLog')}</span>
                    <span>➔</span>
                  </a>
                </>
              )}

              {role === 'EMPLOYEE' && (
                <>
                  <a href="/leave/new" className="action-link">
                    <span>{t('dashboard', 'requestNewLeave')}</span>
                    <span>➔</span>
                  </a>
                  <a href="/leave/history" className="action-link">
                    <span>{t('dashboard', 'viewMyLeaveHistory')}</span>
                    <span>➔</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="activity-panel">
            <h3 className="panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 15 15" />
              </svg>
              {t('dashboard', 'recentPlatformLog')}
            </h3>
            <div className="activity-list">
              {role === 'ADMIN' && (
                <>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#2563eb' }}></div>
                    <div>{t('dashboard', 'adminLog1')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#2563eb' }}></div>
                    <div>{t('dashboard', 'adminLog2')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#2563eb' }}></div>
                    <div>{t('dashboard', 'adminLog3')}</div>
                  </div>
                </>
              )}

              {role === 'HR' && (
                <>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#ea580c' }}></div>
                    <div>{t('dashboard', 'hrLog1')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#ea580c' }}></div>
                    <div>{t('dashboard', 'hrLog2')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#ea580c' }}></div>
                    <div>{t('dashboard', 'hrLog3')}</div>
                  </div>
                </>
              )}

              {role === 'MANAGER' && (
                <>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#16a34a' }}></div>
                    <div>{t('dashboard', 'mgrLog1')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#16a34a' }}></div>
                    <div>{t('dashboard', 'mgrLog2')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#16a34a' }}></div>
                    <div>{t('dashboard', 'mgrLog3')}</div>
                  </div>
                </>
              )}

              {role === 'EMPLOYEE' && (
                <>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#6b7280' }}></div>
                    <div>{t('dashboard', 'empLog1')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#6b7280' }}></div>
                    <div>{t('dashboard', 'empLog2')}</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-bullet" style={{ backgroundColor: '#6b7280' }}></div>
                    <div>{t('dashboard', 'empLog3')}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
