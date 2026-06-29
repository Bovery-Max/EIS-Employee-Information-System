'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { useLanguage } from '../../../context/LanguageContext';
import CustomSelect from '../../../components/CustomSelect';

export default function AuditLogsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const allRows = [
    { date: '2026-06-23 09:00', user: 'admin@eis.com', action: 'LOGIN', detailsKey: 'details_login' },
    { date: '2026-06-23 09:05', user: 'employee@eis.com', action: 'LEAVE_REQUEST', detailsKey: 'details_leave' },
    { date: '2026-06-23 09:10', user: 'manager@eis.com', action: 'APPROVE', detailsKey: 'details_mgr_approve' },
    { date: '2026-06-23 09:15', user: 'hr@eis.com', action: 'APPROVE', detailsKey: 'details_hr_approve' },
  ];

  const filteredRows = allRows.filter((row) => {
    const matchesUser = filterUser ? row.user.toLowerCase().includes(filterUser.toLowerCase()) : true;
    const matchesAction = filterAction ? row.action === filterAction : true;
    return matchesUser && matchesAction;
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('eis_role');
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
    }
  }, [router]);

  if (!role) return null;

  const actionOptions = ['LOGIN', 'LEAVE_REQUEST', 'APPROVE'];

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
        .dark .users-table th, .dark .history-table th, .dark .logs-table th, .dark .table-header-container {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .dark .log-user-cell, .dark .log-date-cell {
          color: var(--text-main);
        }
        .dark .users-table tr, .dark .history-table tr, .dark .logs-table tr {
          border-color: var(--border-color);
        }
        .dark .users-table tbody tr:hover, .dark .history-table tbody tr:hover, .dark .logs-table tbody tr:hover {
          background-color: var(--bg-hover);
        }
        .dark .users-table td, .dark .history-table td, .dark .logs-table td {
          color: var(--text-main);
        }
        .dark input, .dark select, .dark textarea {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
        .dark .user-name, .dark .modal-header, .dark h2 {
          color: var(--text-main);
        }
        .dark .search-input {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
    
        .logs-wrapper {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 1100px;
        }

        .filter-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-inputs-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-input {
          padding: 10px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          width: 240px;
          transition: all 0.2s;
        }

        .filter-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          width: 180px;
          background-color: var(--bg-card, #ffffff);
          transition: all 0.2s;
        }

        .filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-table th {
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

        .logs-table tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .logs-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .logs-table td {
          padding: 16px 24px;
          font-size: 14px;
          color: #334155;
          vertical-align: middle;
        }

        .log-date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: monospace;
          color: #475569;
          font-weight: 500;
        }

        .log-user-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #0f172a;
        }

        .user-icon {
          color: #64748b;
          background-color: #f1f5f9;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Action Badges */
        .action-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .action-login {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        .action-leave_request {
          background-color: #f3e8ff;
          color: #6b21a8;
        }

        .action-approve {
          background-color: #dcfce7;
          color: #16a34a;
        }

        .action-other {
          background-color: #f1f5f9;
          color: #475569;
        }
      ` }} />

      {/* Main content */}
      <main className="flex-1 p-8 text-slate-900 dark:text-slate-100">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('auditLogs', 'title')}</h2>
            <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
              {t('auditLogs', 'description')}
            </p>
          </div>
        </div>

        <div className="logs-wrapper">
          <div className="filter-container">
            <div className="filter-inputs-group">
              <input 
                type="text" 
                placeholder={t('auditLogs', 'filterPlaceholder')} 
                className="filter-input"
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
              />
              <CustomSelect 
                className="filter-select"
                value={filterAction}
                onChange={setFilterAction}
                options={[
                  { value: '', label: t('auditLogs', 'allActions') || 'All Actions' },
                  ...actionOptions.map(opt => ({ value: opt, label: t('auditLogs', opt) || opt }))
                ]}
              />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {t('auditLogs', 'showingEntries').replace('{count}', filteredRows.length.toString())}
            </div>
          </div>

          <table className="logs-table">
            <thead>
              <tr>
                <th>{t('auditLogs', 'dateAndTime')}</th>
                <th>{t('auditLogs', 'user')}</th>
                <th>{t('auditLogs', 'action')}</th>
                <th>{t('auditLogs', 'details')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="log-date-cell">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {row.date}
                    </div>
                  </td>
                  <td>
                    <div className="log-user-cell">
                      <div className="user-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      {row.user}
                    </div>
                  </td>
                  <td>
                    <span className={`action-badge action-${row.action.toLowerCase()}`}>
                      {t('auditLogs', row.action) || row.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>{t('auditLogs', row.detailsKey)}</td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontWeight: '500' }}>
                    {t('auditLogs', 'noLogs')}
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
