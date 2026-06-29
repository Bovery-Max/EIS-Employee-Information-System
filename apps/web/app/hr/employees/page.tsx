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

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  department: string;
  status: 'Active' | 'Inactive';
  balance: number;
}

export default function EmployeesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
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

  // Load employees dynamically from eis_users or fallbacks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let usersList: UserRow[] = [];
      const savedUsers = localStorage.getItem('eis_users');
      if (savedUsers) {
        try {
          usersList = JSON.parse(savedUsers);
        } catch (e) {
          console.error('Error parsing eis_users', e);
        }
      }

      // Fallback if local storage is empty
      if (usersList.length === 0) {
        usersList = [
          { id: '1', name: 'John Doe', email: 'john@eis.com', role: 'EMPLOYEE', department: 'Engineering', status: 'Active' },
          { id: '2', name: 'Jane Smith', email: 'jane@eis.com', role: 'HR', department: 'HR Dept', status: 'Active' },
          { id: '3', name: 'Bob Johnson', email: 'bob@eis.com', role: 'MANAGER', department: 'Engineering', status: 'Active' },
          { id: '4', name: 'Admin User', email: 'admin@eis.com', role: 'ADMIN', department: 'Management', status: 'Active' },
        ];
        localStorage.setItem('eis_users', JSON.stringify(usersList));
      }

      // Load or generate leave balances mapped by ID
      let leaveBalances: Record<string, number> = {};
      const savedLeaves = localStorage.getItem('eis_employee_leaves');
      if (savedLeaves) {
        try {
          leaveBalances = JSON.parse(savedLeaves);
        } catch (e) {
          console.error('Error parsing eis_employee_leaves', e);
        }
      }

      const mapped = usersList.map(u => {
        let bal = leaveBalances[u.id];
        if (bal === undefined) {
          if (u.role === 'ADMIN') bal = 24;
          else if (u.role === 'MANAGER') bal = 20;
          else if (u.role === 'HR') bal = 18;
          else bal = 14;
          leaveBalances[u.id] = bal;
        }
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department || 'General',
          status: u.status,
          balance: bal
        };
      });

      localStorage.setItem('eis_employee_leaves', JSON.stringify(leaveBalances));
      setEmployees(mapped);
      setLoaded(true);
    }
  }, []);

  if (!role || !loaded) return null;

  // Get initials for avatars
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Unique departments for filtering
  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  // Filtering logic
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query);

    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  // Calculate metrics
  const totalEmployees = employees.length;
  const uniqueDepts = new Set(employees.map(e => e.department)).size;
  const avgLeaves = employees.length > 0 
    ? Math.round(employees.reduce((acc, curr) => acc + curr.balance, 0) / employees.length)
    : 0;

  const translateName = (name: string) => {
    if (lang !== 'tr') return name;
    if (name === 'Employee User') return 'Çalışan Kullanıcı';
    if (name === 'Manager User') return 'Yönetici Kullanıcı';
    if (name === 'HR User') return 'İK Kullanıcısı';
    if (name === 'Admin User') return 'Sistem Yöneticisi';
    return name;
  };

  const translateDepartment = (dept: string) => {
    if (lang !== 'tr') return dept;
    if (dept === 'Management') return 'Yönetim';
    if (dept === 'HR Dept') return 'İnsan Kaynakları';
    if (dept === 'Engineering') return 'Mühendislik';
    if (dept === 'Sales') return 'Satış';
    if (dept === 'Marketing') return 'Pazarlama';
    return dept;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar role={role} currentPath={pathname} />

      {/* Styled styling container */}
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
        .dark .users-table th, .dark .history-table th, .dark .employees-table th, .dark .table-header-container {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .dark .users-table tr, .dark .history-table tr, .dark .employees-table tr {
          border-color: var(--border-color);
        }
        .dark .users-table tbody tr:hover, .dark .history-table tbody tr:hover, .dark .employees-table tbody tr:hover {
          background-color: var(--bg-hover);
        }
        .dark .users-table td, .dark .history-table td, .dark .employees-table td {
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

        .employees-wrapper {
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

        .employees-table {
          width: 100%;
          border-collapse: collapse;
        }

        .employees-table th {
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

        .employees-table tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .employees-table tbody tr:hover {
          background-color: #f8fafc;
        }

        .dark .employees-table tr {
          border-color: var(--border-color, #334155);
        }

        .employees-table td {
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
          color: var(--text-muted, #64748b);
          font-weight: 500;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main, #0f172a);
          margin-top: 2px;
        }
        
        .balance-bar-container {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          margin-top: 4px;
          overflow: hidden;
        }
        .balance-bar-fill {
          height: 100%;
          background: #10b981;
          border-radius: 3px;
        }
      ` }} />

      <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
        {/* Header Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('employeesPage', 'title') || 'Employee Directory'}</h2>
          <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
            {t('employeesPage', 'subtitle') || 'View and search employee records, roles, departments, and active leave balances.'}
          </p>
        </div>

        {/* Dynamic Metric Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap', maxWidth: '1100px' }}>
          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="metric-details">
              <span className="metric-label">{t('employeesPage', 'totalEmployees') || 'Total Employees'}</span>
              <span className="metric-value">{totalEmployees}</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="metric-details">
              <span className="metric-label">{t('employeesPage', 'activeDepartments') || 'Active Departments'}</span>
              <span className="metric-value">{uniqueDepts}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="metric-details">
              <span className="metric-label">{t('employeesPage', 'avgLeaveBalance') || 'Avg Leave Balance'}</span>
              <span className="metric-value">{avgLeaves} {t('employeesPage', 'daysText') || 'Days'}</span>
            </div>
          </div>
        </div>

        {/* Main Directory Table Wrapper */}
        <div className="employees-wrapper">
          <div className="controls-container">
            <div className="search-group">
              <input
                type="text"
                placeholder={t('employeesPage', 'searchPlaceholder') || 'Search employees...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <CustomSelect
                value={deptFilter}
                onChange={setDeptFilter}
                className="filter-select"
                options={[
                  { value: 'ALL', label: t('employeesPage', 'allDepartments') || 'All Departments' },
                  ...departments.filter(d => d !== 'ALL').map(d => ({ value: d, label: translateDepartment(d) }))
                ]}
              />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {(t('employeesPage', 'showingEmployees') || 'Showing {count} employees').replace('{count}', filteredEmployees.length.toString())}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="overflow-x-auto w-full pb-4"><table className="employees-table">
              <thead>
                <tr>
                  <th>{t('employeesPage', 'employee') || 'EMPLOYEE'}</th>
                  <th>{t('employeesPage', 'department') || 'DEPARTMENT'}</th>
                  <th>{t('employeesPage', 'role') || 'ROLE'}</th>
                  <th>{t('employeesPage', 'status') || 'STATUS'}</th>
                  <th>{t('employeesPage', 'leaveBalance') || 'LEAVE BALANCE'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const roleLower = emp.role.toLowerCase() as 'admin' | 'hr' | 'manager' | 'employee';
                  const avatarClass = `user-avatar avatar-${roleLower}`;
                  const roleClass = `role-badge role-${roleLower}`;
                  const statusClass = `status-badge status-${emp.status.toLowerCase()}`;
                  
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="user-info-cell">
                          <div className={avatarClass}>
                            {getInitials(translateName(emp.name))}
                          </div>
                          <div className="user-details">
                            <span className="user-name">{translateName(emp.name)}</span>
                            <span className="user-email">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>
                          {translateDepartment(emp.department)}
                        </span>
                      </td>
                      <td>
                        <span className={roleClass}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <span className={statusClass}>
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '130px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main, #1e293b)', fontWeight: 600, fontSize: '13px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>{emp.balance} days</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (emp.balance / 30) * 100)}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '3px' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontWeight: '500' }}>
                      No employees found matching the filters.
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
