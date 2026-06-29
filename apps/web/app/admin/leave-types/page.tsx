'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { useLanguage } from '../../../context/LanguageContext';
import CustomSelect from '../../../components/CustomSelect';

interface LeaveTypeRow {
  id: string;
  name: string;
  duration: string;
  weekends: boolean;
  document: boolean;
}

const initialLeaveTypes: LeaveTypeRow[] = [
  { id: '1', name: 'Annual Leave', duration: 'Min. 14 days/year', weekends: false, document: false },
  { id: '2', name: 'Paternity Leave', duration: '5 working days', weekends: false, document: true },
  { id: '3', name: 'Sick Leave', duration: 'Per medical report', weekends: true, document: true },
  { id: '4', name: 'Marriage Leave', duration: '3 working days', weekends: false, document: true },
  { id: '5', name: 'Bereavement (1st degree)', duration: '3 working days', weekends: false, document: false },
  { id: '6', name: 'Bereavement (2nd degree)', duration: '2 working days', weekends: false, document: false },
];

export default function LeaveTypesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  
  // Leave Types State
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRow[]>(initialLeaveTypes);
  const [loaded, setLoaded] = useState(false);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    leaveTypeId: string;
    name: string;
    duration: string;
    weekends: boolean;
    document: boolean;
  }>({
    isOpen: false,
    mode: 'add',
    leaveTypeId: '',
    name: '',
    duration: '',
    weekends: false,
    document: false
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('eis_role');
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
    }
  }, [router]);

  // Load leave types from local storage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eis_leave_types');
      if (saved) {
        try {
          setLeaveTypes(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading saved leave types', e);
        }
      }
      setLoaded(true);
    }
  }, []);

  // Save leave types to local storage when changed
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      localStorage.setItem('eis_leave_types', JSON.stringify(leaveTypes));
    }
  }, [leaveTypes, loaded]);

  if (!role) return null;

  const handleOpenAddModal = () => {
    setModal({
      isOpen: true,
      mode: 'add',
      leaveTypeId: '',
      name: '',
      duration: '',
      weekends: false,
      document: false
    });
  };

  const handleOpenEditModal = (lt: LeaveTypeRow) => {
    setModal({
      isOpen: true,
      mode: 'edit',
      leaveTypeId: lt.id,
      name: lt.name,
      duration: lt.duration,
      weekends: lt.weekends,
      document: lt.document
    });
  };

  const handleDeleteLeaveType = (id: string) => {
    if (confirm('Are you sure you want to delete this leave type?')) {
      setLeaveTypes(prev => prev.filter(lt => lt.id !== id));
    }
  };

  const handleSaveLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.name.trim() || !modal.duration.trim()) return;

    if (modal.mode === 'add') {
      const newLt: LeaveTypeRow = {
        id: Date.now().toString(),
        name: modal.name,
        duration: modal.duration,
        weekends: modal.weekends,
        document: modal.document
      };
      setLeaveTypes(prev => [...prev, newLt]);
    } else {
      setLeaveTypes(prev => prev.map(lt => lt.id === modal.leaveTypeId ? {
        ...lt,
        name: modal.name,
        duration: modal.duration,
        weekends: modal.weekends,
        document: modal.document
      } : lt));
    }

    setModal(prev => ({ ...prev, isOpen: false }));
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
        .dark .users-table th, .dark .history-table th, .dark .types-table th, .dark .table-header-container {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .dark .leave-type-name {
          color: var(--text-main);
        }
        .dark .users-table tr, .dark .history-table tr, .dark .types-table tr {
          border-color: var(--border-color);
        }
        .dark .users-table tbody tr:hover, .dark .history-table tbody tr:hover, .dark .types-table tbody tr:hover {
          background-color: var(--bg-hover);
        }
        .dark .users-table td, .dark .history-table td, .dark .types-table td {
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
    
        .types-wrapper {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 1100px;
        }

        .types-table {
          width: 100%;
          border-collapse: collapse;
        }

        .types-table th {
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

        .types-table tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .types-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .types-table td {
          padding: 16px 24px;
          font-size: 14px;
          color: #334155;
          vertical-align: middle;
        }

        .leave-type-name {
          font-weight: 600;
          color: #0f172a;
        }

        /* Badge design */
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-yes { background-color: #dcfce7; color: #16a34a; }
        .badge-no { background-color: #f1f5f9; color: #475569; }
        .badge-doc { background-color: #dbeafe; color: #2563eb; }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .action-btn.edit {
          color: #2563eb;
          background-color: #eff6ff;
        }

        .action-btn.edit:hover {
          background-color: #dbeafe;
          color: #1d4ed8;
        }

        .action-btn.delete {
          color: #dc2626;
          background-color: #fef2f2;
        }

        .action-btn.delete:hover {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        /* Modal Layout */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: var(--bg-card, #ffffff);
          border-radius: 16px;
          padding: 28px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-header {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 18px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .form-group input, .form-group select {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-primary {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      ` }} />

      <main className="flex-1 p-8 text-slate-900 dark:text-slate-100">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('leaveTypes', 'title')}</h2>
            <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
              {t('leaveTypes', 'description')}
            </p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            {t('leaveTypes', 'addLeaveType')}
          </button>
        </div>

        <div className="types-wrapper">
          <table className="types-table">
            <thead>
              <tr>
                <th>{t('leaveTypes', 'leaveType')}</th>
                <th>{t('leaveTypes', 'duration')}</th>
                <th>{t('leaveTypes', 'weekendsCounted')}</th>
                <th>{t('leaveTypes', 'documentRequired')}</th>
                <th>{t('leaveTypes', 'action')}</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((lt) => (
                <tr key={lt.id}>
                  <td>
                    <span className="leave-type-name">{t('leaveTypes', lt.name as any) || lt.name}</span>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {t('leaveTypes', lt.duration as any) || lt.duration}
                  </td>
                  <td>
                    <span className={`status-badge ${lt.weekends ? 'badge-yes' : 'badge-no'}`}>
                      {lt.weekends ? t('leaveTypes', 'yes') : t('leaveTypes', 'no')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${lt.document ? 'badge-doc' : 'badge-no'}`}>
                      {lt.document ? t('leaveTypes', 'yes') : t('leaveTypes', 'no')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit" 
                        title="Edit Leave Type"
                        onClick={() => handleOpenEditModal(lt)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="action-btn delete" 
                        title="Delete Leave Type"
                        onClick={() => handleDeleteLeaveType(lt.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {modal.mode === 'add' ? t('leaveTypes', 'modalAddTitle') : t('leaveTypes', 'modalEditTitle')}
            </div>

            <form onSubmit={handleSaveLeaveType}>
              <div className="form-group">
                <label htmlFor="leaveName">{t('leaveTypes', 'modalName')}</label>
                <input 
                  id="leaveName" 
                  type="text" 
                  placeholder={t('leaveTypes', 'modalNamePlaceholder')}
                  value={modal.name}
                  onChange={e => setModal(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">{t('leaveTypes', 'modalDuration')}</label>
                <input 
                  id="duration" 
                  type="text" 
                  placeholder={t('leaveTypes', 'modalDurationPlaceholder')}
                  value={modal.duration}
                  onChange={e => setModal(prev => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="weekends">{t('leaveTypes', 'modalWeekends')}</label>
                <CustomSelect 
                  id="weekends"
                  value={modal.weekends ? 'yes' : 'no'}
                  onChange={val => setModal(prev => ({ ...prev, weekends: val === 'yes' }))}
                  options={[
                    { value: 'no', label: t('leaveTypes', 'modalNoSkip') || 'No (Skip weekends)' },
                    { value: 'yes', label: t('leaveTypes', 'modalYesCount') || 'Yes (Count weekends)' }
                  ]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="document">{t('leaveTypes', 'modalDocument')}</label>
                <CustomSelect 
                  id="document"
                  value={modal.document ? 'yes' : 'no'}
                  onChange={val => setModal(prev => ({ ...prev, document: val === 'yes' }))}
                  options={[
                    { value: 'no', label: t('leaveTypes', 'modalNoDoc') || 'No document needed' },
                    { value: 'yes', label: t('leaveTypes', 'modalYesDoc') || 'Yes, document required' }
                  ]}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                >
                  {t('leaveTypes', 'cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {t('leaveTypes', 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
