'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { useLanguage } from '../../../context/LanguageContext';

interface LeaveRequest {
  id: string;
  employee: string;
  email: string;
  type: string;
  start: string;
  end: string;
  days: number;
  description?: string;
  status: 'pending_manager' | 'pending_hr' | 'approved' | 'rejected_manager' | 'rejected_hr';
  rejectReason?: string;
}

export default function LeaveHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  // Load and filter leave requests dynamically from local storage
  useEffect(() => {
    if (email && typeof window !== 'undefined') {
      let savedQueue = localStorage.getItem('eis_leave_requests');
      let parsed: LeaveRequest[] = [];
      if (savedQueue) {
        try {
          parsed = JSON.parse(savedQueue);
        } catch (e) {
          console.error('Error parsing eis_leave_requests', e);
        }
      }

      // Default mock leaves in case the database is completely empty
      if (parsed.length === 0) {
        parsed = [
          { id: '101', employee: 'Employee User', email: 'employee@eis.com', type: 'Annual Leave', start: '2026-01-10', end: '2026-01-17', days: 5, status: 'approved' },
          { id: '102', employee: 'Employee User', email: 'employee@eis.com', type: 'Sick Leave', start: '2026-03-05', end: '2026-03-07', days: 3, status: 'rejected_manager', rejectReason: 'Busy week' },
          { id: '103', employee: 'Employee User', email: 'employee@eis.com', type: 'Marriage Leave', start: '2026-05-20', end: '2026-05-22', days: 3, status: 'pending_manager' },
        ];
        localStorage.setItem('eis_leave_requests', JSON.stringify(parsed));
      }

      // Filter requests by logged in user's email
      const userRequests = parsed.filter(req => req.email.toLowerCase() === email.toLowerCase());
      setRequests(userRequests);
      setLoaded(true);
    }
  }, [email]);

  if (!role || !loaded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar role={role || 'EMPLOYEE'} currentPath={pathname} />
        <main className="flex-1 p-8">
          <div className="skeleton-box" style={{ width: '200px', height: '40px', marginBottom: '8px' }}></div>
          <div className="skeleton-box" style={{ width: '300px', height: '20px', marginBottom: '32px' }}></div>
          <div className="skeleton-box" style={{ width: '100%', height: '400px' }}></div>
        </main>
      </div>
    );
  }

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role={role} currentPath={pathname} />

      {/* Injected Premium Styles */}
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
        .dark .users-table th, .dark .history-table th, .dark .table-header-container {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .dark .users-table tr, .dark .history-table tr {
          border-color: var(--border-color);
        }
        .dark .users-table tbody tr:hover, .dark .history-table tbody tr:hover {
          background-color: var(--bg-hover);
        }
        .dark .users-table td, .dark .history-table td {
          color: var(--text-main);
        }
        .dark input, .dark select, .dark textarea {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
        .dark .user-name, .dark .modal-header, .dark h2, .dark .leave-type-cell {
          color: var(--text-main);
        }
        .dark .date-cell {
          color: var(--text-muted);
        }
        .dark .days-badge {
          background-color: var(--bg-hover);
          color: var(--text-main);
        }
        .dark .search-input {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
    
        .history-wrapper {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 1000px;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th {
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

        .history-table tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .history-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .history-table td {
          padding: 16px 24px;
          font-size: 14px;
          color: #334155;
          vertical-align: middle;
        }

        .leave-type-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #0f172a;
        }

        .type-icon {
          color: #3b82f6;
          background-color: #eff6ff;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          font-weight: 500;
        }

        .days-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
        }

        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .status-approved {
          background-color: #dcfce7;
          color: #16a34a;
        }

        .status-rejected {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .status-pending {
          background-color: #dbeafe;
          color: #2563eb;
        }
        
        .status-pending-hr {
          background-color: #f3e8ff;
          color: #7c3aed;
        }
      ` }} />

      <main className="flex-1 p-8 text-slate-900 dark:text-slate-100 page-animate">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('leaveHistory', 'title')}</h2>
          <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
            {t('leaveHistory', 'description')}
          </p>
        </div>

        <div className="history-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>{t('leaveHistory', 'type')}</th>
                <th>{t('leaveHistory', 'startDate')}</th>
                <th>{t('leaveHistory', 'endDate')}</th>
                <th>{t('leaveHistory', 'days')}</th>
                <th>{t('leaveHistory', 'status')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((row) => {
                let badgeClass = 'status-pending';
                let displayStatus = t('leaveHistory', 'pending_manager');

                if (row.status === 'pending_manager') {
                  badgeClass = 'status-pending';
                  displayStatus = t('leaveHistory', 'pending_manager');
                } else if (row.status === 'pending_hr') {
                  badgeClass = 'status-pending-hr';
                  displayStatus = t('leaveHistory', 'pending_hr');
                } else if (row.status === 'approved') {
                  badgeClass = 'status-approved';
                  displayStatus = t('leaveHistory', 'approved');
                } else if (row.status === 'rejected_manager') {
                  badgeClass = 'status-rejected';
                  displayStatus = t('leaveHistory', 'rejected_manager');
                } else if (row.status === 'rejected_hr') {
                  badgeClass = 'status-rejected';
                  displayStatus = t('leaveHistory', 'rejected_hr');
                }

                return (
                  <tr key={row.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="leave-type-cell">
                          <div className="type-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </div>
                          {translateLeaveType(row.type)}
                        </div>
                        {row.description && (
                          <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginLeft: '42px', maxWidth: '240px', wordBreak: 'break-word', display: 'block' }}>
                            "{row.description}"
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {row.start}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {row.end}
                      </div>
                    </td>
                    <td>
                      <span className="days-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {row.days} {lang === 'tr' ? 'gün' : 'day(s)'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          <span className={`status-badge ${badgeClass}`}>
                            {displayStatus}
                          </span>
                        </div>
                        {row.rejectReason && (
                          <div style={{ fontSize: '11px', color: '#dc2626', fontStyle: 'italic' }}>
                            Reason: {row.rejectReason}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {requests.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                      <div style={{ backgroundColor: 'var(--bg-hover, #f1f5f9)', padding: '24px', borderRadius: '50%', color: '#94a3b8' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-main, #334155)' }}>
                        {t('leaveHistory', 'noRequests') || 'No leave requests found.'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
