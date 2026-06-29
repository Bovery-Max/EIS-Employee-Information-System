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

const initialUsers: UserRow[] = [
  { id: '1', name: 'Admin User', email: 'admin@eis.com', role: 'ADMIN', department: 'Management', status: 'Active' },
  { id: '2', name: 'HR User', email: 'hr@eis.com', role: 'HR', department: 'HR Dept', status: 'Active' },
  { id: '3', name: 'Manager User', email: 'manager@eis.com', role: 'MANAGER', department: 'Engineering', status: 'Active' },
  { id: '4', name: 'Employee User', email: 'employee@eis.com', role: 'EMPLOYEE', department: 'Engineering', status: 'Active' },
];

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  
  // Users state
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    userId: string;
    name: string;
    email: string;
    userRole: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
    department: string;
    status: 'Active' | 'Inactive';
  }>({
    isOpen: false,
    mode: 'add',
    userId: '',
    name: '',
    email: '',
    userRole: 'EMPLOYEE',
    department: '',
    status: 'Active'
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('eis_role');
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
    }
  }, [router]);

  // Load users from local storage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eis_users');
      if (saved) {
        try {
          setUsers(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading saved users', e);
        }
      }
      setLoaded(true);
    }
  }, []);

  // Save users to local storage when changed
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      localStorage.setItem('eis_users', JSON.stringify(users));
    }
  }, [users, loaded]);

  if (!role) return null;

  const handleOpenAddModal = () => {
    setModal({
      isOpen: true,
      mode: 'add',
      userId: '',
      name: '',
      email: '',
      userRole: 'EMPLOYEE',
      department: '',
      status: 'Active'
    });
  };

  const handleOpenEditModal = (user: UserRow) => {
    setModal({
      isOpen: true,
      mode: 'edit',
      userId: user.id,
      name: user.name,
      email: user.email,
      userRole: user.role,
      department: user.department,
      status: user.status
    });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.name.trim() || !modal.email.trim()) return;

    if (modal.mode === 'add') {
      const newUser: UserRow = {
        id: Date.now().toString(),
        name: modal.name,
        email: modal.email,
        role: modal.userRole,
        department: modal.department || '—',
        status: modal.status
      };
      setUsers(prev => [...prev, newUser]);
    } else {
      setUsers(prev => prev.map(u => u.id === modal.userId ? {
        ...u,
        name: modal.name,
        email: modal.email,
        role: modal.userRole,
        department: modal.department || '—',
        status: modal.status
      } : u));
    }

    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getTranslatedName = (name: string) => {
    if (lang !== 'tr') return name;
    if (name === 'Admin User') return 'Sistem Yöneticisi';
    if (name === 'HR User') return 'İK Personeli';
    if (name === 'Manager User') return 'Birim Yöneticisi';
    if (name === 'Employee User') return 'Çalışan';
    return name;
  };

  // Filtered users for search bar
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      u.department.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
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
        .dark .user-name, .dark .modal-header, .dark h2 {
          color: var(--text-main);
        }
        .dark .search-input {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
    
        .users-table-wrapper {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 1100px;
        }

        .table-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
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
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
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

        .users-table tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .users-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .users-table td {
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

        /* Badges for roles */
        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-admin { background-color: #e0e7ff; color: #4f46e5; }
        .role-hr { background-color: #fce7f3; color: #db2777; }
        .role-manager { background-color: #e0f2fe; color: #0369a1; }
        .role-employee { background-color: #f0fdf4; color: #166534; }

        /* Status badge */
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-active { background-color: #dcfce7; color: #16a34a; }
        .status-inactive { background-color: #fee2e2; color: #dc2626; }

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

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('users', 'title')}</h2>
            <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
              {t('users', 'description')}
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
            {t('users', 'addUser')}
          </button>
        </div>

        <div className="users-table-wrapper">
          <div className="table-header-container">
            <input 
              type="text" 
              placeholder={t('users', 'searchPlaceholder')} 
              className="search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {t('users', 'totalUsersCount').replace('{count}', filteredUsers.length.toString())}
            </div>
          </div>

          <div className="overflow-x-auto w-full pb-4"><table className="users-table">
            <thead>
              <tr>
                <th>{t('users', 'userDetails')}</th>
                <th>{t('users', 'role')}</th>
                <th>{t('users', 'department')}</th>
                <th>{t('users', 'status')}</th>
                <th>{t('users', 'action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className={`user-avatar avatar-${u.role.toLowerCase()}`}>
                        {getInitials(getTranslatedName(u.name))}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{getTranslatedName(u.name)}</span>
                        <span className="user-email">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${u.role.toLowerCase()}`}>
                      {t('users', u.role.toLowerCase())}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {u.department ? (t('users', u.department as any) || u.department) : '—'}
                  </td>
                  <td>
                    <span className={`status-badge status-${u.status.toLowerCase()}`}>
                      {u.status === 'Active' ? t('users', 'activeStatus') : t('users', 'inactiveStatus')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit" 
                        title="Edit User"
                        onClick={() => handleOpenEditModal(u)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="action-btn delete" 
                        title="Delete User"
                        onClick={() => handleDeleteUser(u.id)}
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontWeight: '500' }}>
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {modal.mode === 'add' ? t('users', 'modalAddTitle') : t('users', 'modalEditTitle')}
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label htmlFor="fullName">{t('users', 'modalFullName')}</label>
                <input 
                  id="fullName" 
                  type="text" 
                  placeholder={t('users', 'modalFullNamePlaceholder')}
                  value={modal.name}
                  onChange={e => setModal(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('users', 'modalEmail')}</label>
                <input 
                  id="email" 
                  type="email" 
                  placeholder={t('users', 'modalEmailPlaceholder')}
                  value={modal.email}
                  onChange={e => setModal(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="userRole">{t('users', 'modalRole')}</label>
                <CustomSelect 
                  id="userRole" 
                  value={modal.userRole}
                  onChange={val => setModal(prev => ({ ...prev, userRole: val as any }))}
                  options={[
                    { value: 'ADMIN', label: 'ADMIN' },
                    { value: 'HR', label: 'HR' },
                    { value: 'MANAGER', label: 'MANAGER' },
                    { value: 'EMPLOYEE', label: 'EMPLOYEE' }
                  ]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">{t('users', 'modalDepartment')}</label>
                <input 
                  id="department" 
                  type="text" 
                  placeholder={t('users', 'modalDeptPlaceholder')}
                  value={modal.department}
                  onChange={e => setModal(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">{t('users', 'modalStatus')}</label>
                <CustomSelect 
                  id="status" 
                  value={modal.status}
                  onChange={val => setModal(prev => ({ ...prev, status: val as any }))}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                >
                  {t('users', 'cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {t('users', 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
