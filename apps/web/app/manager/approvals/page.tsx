'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { useLanguage } from '../../../context/LanguageContext';
import CustomSelect from '../../../components/CustomSelect';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  department: string;
  status: 'Active' | 'Inactive';
}

interface Row {
  id: string;
  employee: string;
  email?: string;
  type: string;
  start: string;
  end: string;
  days: number;
  description?: string;
  status: 'pending_manager' | 'pending_hr' | 'approved' | 'rejected_manager' | 'rejected_hr';
  rejectReason?: string;
}

export default function ManagerApprovalsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loaded, setLoaded] = useState(false);
  const { t, lang } = useLanguage();

  useEffect(() => {
    const storedRole = localStorage.getItem('eis_role');
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
    }
  }, [router]);

  // Load approvals queue dynamically from local storage or fallback mock data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let savedQueue = localStorage.getItem('eis_leave_requests');
      let parsed: Row[] = [];
      if (savedQueue) {
        try {
          parsed = JSON.parse(savedQueue);
        } catch (e) {
          console.error('Error parsing eis_leave_requests', e);
        }
      }

      if (parsed.length === 0) {
        parsed = [
          { id: '1', employee: 'John Doe', type: 'Annual Leave', start: '2026-07-01', end: '2026-07-05', days: 5, description: 'Annual family vacation to Italy.', status: 'pending_manager' },
          { id: '2', employee: 'Jane Smith', type: 'Sick Leave', start: '2026-07-10', end: '2026-07-12', days: 3, description: 'Severe flu, doctor recommended rest.', status: 'pending_manager' },
        ];
        localStorage.setItem('eis_leave_requests', JSON.stringify(parsed));
      }

      setRows(parsed);
      setLoaded(true);
    }
  }, []);

  // Save approvals back to local storage on modification
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      localStorage.setItem('eis_leave_requests', JSON.stringify(rows));
    }
  }, [rows, loaded]);

  if (!role || !loaded) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar role={role || 'MANAGER'} currentPath="/manager/approvals" />
        <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden">
          <div className="skeleton-box" style={{ width: '250px', height: '40px', marginBottom: '8px' }}></div>
          <div className="skeleton-box" style={{ width: '350px', height: '20px', marginBottom: '32px' }}></div>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div className="skeleton-box" style={{ flex: 1, height: '120px' }}></div>
            <div className="skeleton-box" style={{ flex: 1, height: '120px' }}></div>
            <div className="skeleton-box" style={{ flex: 1, height: '120px' }}></div>
          </div>
          <div className="skeleton-box" style={{ width: '100%', height: '400px' }}></div>
        </main>
      </div>
    );
  }

  // Lookup details (avatar color, email) from eis_users if available
  const getUserDetails = (name: string) => {
    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('eis_users');
      if (savedUsers) {
        try {
          const parsedUsers: UserRow[] = JSON.parse(savedUsers);
          const found = parsedUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
          if (found) {
            return {
              email: found.email,
              role: found.role.toLowerCase() as 'admin' | 'hr' | 'manager' | 'employee'
            };
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // fallback mapping
    const lowerName = name.toLowerCase();
    if (lowerName.includes('jane')) {
      return { email: 'jane@eis.com', role: 'hr' as const };
    }
    if (lowerName.includes('bob')) {
      return { email: 'bob@eis.com', role: 'manager' as const };
    }
    if (lowerName.includes('admin')) {
      return { email: 'admin@eis.com', role: 'admin' as const };
    }
    return { email: `${lowerName.replace(' ', '')}@eis.com`, role: 'employee' as const };
  };

  const translateLeaveType = (type: string) => {
    if (lang !== 'tr') return type;
    if (type.includes('Annual Leave')) return type.replace('Annual Leave', 'Yıllık İzin');
    if (type.includes('Sick Leave')) return type.replace('Sick Leave', 'Hastalık İzni');
    if (type.includes('Casual Leave')) return type.replace('Casual Leave', 'Mazeret İzni');
    if (type.includes('Marriage Leave')) return type.replace('Marriage Leave', 'Evlilik İzni');
    if (type.includes('Bereavement Leave')) return type.replace('Bereavement Leave', 'Vefat İzni');
    if (type.includes('Paternity Leave')) return type.replace('Paternity Leave', 'Babalık İzni');
    return type;
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const triggerNotification = (recipientEmail: string, title: string, message: string, link?: string) => {
    let list = [];
    const saved = localStorage.getItem('eis_notifications');
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const newNotif = {
      id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      email: recipientEmail,
      title: title,
      message: message,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      link: link
    };
    list.unshift(newNotif);
    localStorage.setItem('eis_notifications', JSON.stringify(list));
    window.dispatchEvent(new Event('eis_notification_update'));
  };

  const handleApprove = (id: string) => {
    const request = rows.find(r => r.id === id);
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: 'pending_hr' } : row))
    );
    if (request) {
      const emailResolved = request.email || getUserDetails(request.employee).email;
      // 1. Notify HR
      triggerNotification(
        'hr@eis.com',
        'Leave Request Approved by Manager',
        `Manager approved ${request.employee}'s request for ${request.days} days (${request.type}). Awaiting your review.`,
        '/hr/approvals'
      );
      // 2. Notify Employee
      triggerNotification(
        emailResolved,
        'Leave Request Approved by Manager',
        `Your request for ${request.days} days (${request.type}) was approved by the manager and forwarded to HR.`,
        '/leave/history'
      );
    }
  };

  const handleReject = (id: string) => {
    const request = rows.find(r => r.id === id);
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: 'rejected_manager' } : row))
    );
    if (request) {
      const emailResolved = request.email || getUserDetails(request.employee).email;
      // Notify Employee
      triggerNotification(
        emailResolved,
        'Leave Request Rejected by Manager',
        `Your request for ${request.days} days (${request.type}) was rejected by the manager.`,
        '/leave/history'
      );
    }
  };

  const updateReason = (id: string, reason: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, rejectReason: reason } : row))
    );
  };

  // Unique leave types for filter select
  const leaveTypes = ['ALL', ...Array.from(new Set(rows.map(r => r.type).filter(Boolean)))];

  // Filtered rows for search/type filter
  const filteredRows = rows.filter(row => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      row.employee.toLowerCase().includes(query) ||
      row.type.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query);

    const matchesType = typeFilter === 'ALL' || row.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate statistics
  const countPending = rows.filter(r => r.status === 'pending_manager').length;
  const countApproved = rows.filter(r => ['pending_hr', 'approved', 'rejected_hr'].includes(r.status)).length;
  const countRejected = rows.filter(r => r.status === 'rejected_manager').length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar role={role} currentPath={pathname} />

      <style dangerouslySetInnerHTML={{ __html: `
        .dark {
          --bg-card: #1e293b;
          --bg-body: #0f172a;
          --border-color: #334155;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --bg-hover: rgba(59, 130, 246, 0.15);
          --bg-input: #1e293b;
        }
        .dark .users-table-wrapper, .dark .modal-content, .dark .org-container, .dark .leave-card, .dark .history-container, .dark .notification-card {
          background-color: var(--bg-card);
          border-color: var(--border-color);
        }
        .dark .users-table th, .dark .history-table th, .dark .approvals-table th, .dark .table-header-container {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .dark .users-table tr, .dark .history-table tr, .dark .approvals-table tr {
          border-color: var(--border-color);
        }
        .dark .users-table tbody tr:hover, .dark .history-table tbody tr:hover, .dark .approvals-table tbody tr:hover {
          background-color: var(--bg-hover);
        }
        .dark .users-table td, .dark .history-table td, .dark .approvals-table td {
          color: var(--text-main);
        }
        .dark input, .dark select, .dark textarea {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
        .dark .user-name, .dark .modal-header, .dark h2, .dark .metric-value {
          color: var(--text-main);
        }
        .dark .user-email, .dark .user-description, .dark .metric-label {
          color: var(--text-muted);
        }
        .dark .search-input {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
    
        .approvals-wrapper {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 1100px;
        }

        .controls-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-input {
          padding: 10px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          width: 280px;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          width: 180px;
          background-color: var(--bg-card, #ffffff);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .approvals-table {
          width: 100%;
          border-collapse: collapse;
        }

        .approvals-table th {
          background-color: #f8fafc;
          padding: 16px 24px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .approvals-table tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .approvals-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .approvals-table td {
          padding: 16px 24px;
          font-size: 14px;
          color: #334155;
          vertical-align: middle;
        }

        .user-info-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .avatar-admin { background: #e0e7ff; color: #4f46e5; border: 1.5px solid #4f46e5; }
        .avatar-hr { background: #fce7f3; color: #db2777; border: 1.5px solid #db2777; }
        .avatar-manager { background: #e0f2fe; color: #0369a1; border: 1.5px solid #0369a1; }
        .avatar-employee { background: #f0fdf4; color: #166534; border: 1.5px solid #166534; }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #0f172a;
        }

        .user-email {
          font-size: 12px;
          color: #64748b;
          margin-top: 1px;
        }

        .leave-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .type-annual { background-color: #eff6ff; color: #2563eb; }
        .type-sick { background-color: #fee2e2; color: #dc2626; }
        .type-casual { background-color: #fef3c7; color: #d97706; }
        .type-marriage { background-color: #f0fdf4; color: #16a34a; }
        .type-other { background-color: #f1f5f9; color: #475569; }

        .date-range-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-weight: 500;
        }

        .days-pill {
          display: inline-block;
          padding: 4px 12px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .approve-btn {
          background-color: #10b981;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .approve-btn:hover {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .reject-btn {
          background-color: #ef4444;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .reject-btn:hover {
          background-color: #dc2626;
          transform: translateY(-1px);
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .indicator-approved { background-color: #dcfce7; color: #16a34a; }
        .indicator-rejected { background-color: #fee2e2; color: #dc2626; }

        .reject-reason-input {
          width: 100%;
          max-width: 220px;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }

        .reject-reason-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .metric-card {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 220px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005);
        }

        .metric-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-details {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
        }
      ` }} />

      <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden text-slate-900 dark:text-slate-100 page-animate">
        {/* Title Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('approvals', 'teamTitle') || 'Team Approvals Queue'}</h2>
          <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
            {t('approvals', 'teamSubtitle') || 'Review, approve, or reject leave requests submitted by your team members.'}
          </p>
        </div>

        {/* Dynamic Metric Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap', maxWidth: '1100px' }}>
          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="metric-details">
              <span className="metric-label">{t('approvals', 'pendingQueue') || 'Pending Queue'}</span>
              <span className="metric-value">{countPending}</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="metric-details">
              <span className="metric-label">{t('approvals', 'approvedRequests') || 'Approved Requests'}</span>
              <span className="metric-value">{countApproved}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="metric-details">
              <span className="metric-label">{t('approvals', 'rejectedRequests') || 'Rejected Requests'}</span>
              <span className="metric-value">{countRejected}</span>
            </div>
          </div>
        </div>

        {/* Approvals Table Card */}
        <div className="approvals-wrapper">
          <div className="controls-container">
            <div className="search-group">
              <input
                type="text"
                placeholder={t('approvals', 'searchPlaceholder') || 'Search requests...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <CustomSelect
                value={typeFilter}
                onChange={setTypeFilter}
                className="filter-select"
                options={[
                  { value: 'ALL', label: t('approvals', 'allLeaveTypes') || 'All Leave Types' },
                  ...leaveTypes.filter(t => t !== 'ALL').map(t => ({ value: t, label: t }))
                ]}
              />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {(t('approvals', 'showingRequests') || 'Showing {count} requests').replace('{count}', filteredRows.length.toString())}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="overflow-x-auto w-full pb-4"><table className="approvals-table">
              <thead>
                <tr>
                  <th>{t('approvals', 'employee') || 'EMPLOYEE'}</th>
                  <th>{t('approvals', 'leaveType') || 'LEAVE TYPE'}</th>
                  <th>{t('approvals', 'duration') || 'DURATION'}</th>
                  <th>{t('approvals', 'days') || 'DAYS'}</th>
                  <th>{t('approvals', 'actionStatus') || 'ACTION / STATUS'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const details = getUserDetails(row.employee);
                  const avatarIndex = (row.employee.length % 4) + 1;
                  const avatarClass = `user-avatar avatar-gradient-${avatarIndex}`;
                  
                  let badgeTypeClass = 'type-other';
                  if (row.type.toLowerCase().includes('annual')) badgeTypeClass = 'type-annual';
                  else if (row.type.toLowerCase().includes('sick')) badgeTypeClass = 'type-sick';
                  else if (row.type.toLowerCase().includes('casual')) badgeTypeClass = 'type-casual';
                  else if (row.type.toLowerCase().includes('marriage')) badgeTypeClass = 'type-marriage';

                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="user-info-cell">
                          <div className={avatarClass}>
                            {getInitials(row.employee)}
                          </div>
                          <div className="user-details">
                            <span className="user-name">{row.employee === 'Employee User' && lang === 'tr' ? 'Çalışan Kullanıcı' : row.employee}</span>
                            <span className="user-email">{details.email}</span>
                            {row.description ? (
                              <span className="user-description" style={{ marginTop: '6px', fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', maxWidth: '240px', wordBreak: 'break-word', display: 'block' }}>
                                "{row.description}"
                              </span>
                            ) : (
                              <span className="user-description" style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', display: 'block' }}>
                                {t('approvals', 'noDescription') || 'No description provided'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`leave-badge ${badgeTypeClass}`}>
                          {translateLeaveType(row.type)}
                        </span>
                      </td>
                      <td>
                        <div className="date-range-cell">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{row.start}</span>
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>➔</span>
                          <span>{row.end}</span>
                        </div>
                      </td>
                      <td>
                        <span className="days-pill">
                          {row.days} {t('approvals', 'daysText') || 'Days'}
                        </span>
                      </td>
                      <td>
                        {row.status === 'pending_manager' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleApprove(row.id)}
                              className="approve-btn"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              {t('approvals', 'approve') || 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(row.id)}
                              className="reject-btn"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              {t('approvals', 'reject') || 'Reject'}
                            </button>
                          </div>
                        )}

                        {row.status === 'pending_hr' && (
                          <span className="status-indicator indicator-approved" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {t('approvals', 'approved') || 'Approved'} (Pending HR)
                          </span>
                        )}

                        {row.status === 'approved' && (
                          <span className="status-indicator indicator-approved">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {t('approvals', 'approved') || 'Approved'}
                          </span>
                        )}

                        {row.status === 'rejected_manager' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>
                              <span className="status-indicator indicator-rejected">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                {t('approvals', 'rejected') || 'Rejected'}
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder={t('approvals', 'reasonPlaceholder') || 'Reason for rejection'}
                              value={row.rejectReason || ''}
                              onChange={(e) => updateReason(row.id, e.target.value)}
                              className="reject-reason-input"
                            />
                          </div>
                        )}

                        {row.status === 'rejected_hr' && (
                          <span className="status-indicator indicator-rejected">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            {t('approvals', 'rejectedByHR') || 'Rejected by HR'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: 'var(--bg-hover, #f1f5f9)', padding: '24px', borderRadius: '50%', color: '#94a3b8' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="M12 8v4"></path>
                            <path d="M12 16h.01"></path>
                          </svg>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-main, #334155)' }}>
                          {t('approvals', 'noApprovals') || 'No approvals found matching the filters.'}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>
        </div>
      </main>
    </div>
  );
}
