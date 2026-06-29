'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { useLanguage } from '../../../context/LanguageContext';
import CustomSelect from '../../../components/CustomSelect';

export default function NewLeavePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState('Annual Leave');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [days, setDays] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load role/email – redirect if not logged in
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

  // Calculate working days whenever dates change
  useEffect(() => {
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      const diff = Math.max(0, Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      setDays(diff);
    } else {
      setDays(0);
    }
  }, [start, end]);

  const needsDocument = [
    'Paternity Leave', 'Sick Leave', 'Marriage Leave', 'Bereavement Leave',
    'Bereavement Leave (Sibling)', 'Maternity Leave (Prenatal)', 'Maternity Leave (Postnatal)',
    'Birth Assistance Leave'
  ].includes(type);

  const hintMap: Record<string, string> = {
    'Paternity Leave': t('leaveRequest', 'hint_paternity'),
    'Sick Leave': t('leaveRequest', 'hint_sick'),
    'Marriage Leave': t('leaveRequest', 'hint_marriage'),
    'Bereavement Leave': t('leaveRequest', 'hint_bereavement'),
    'Bereavement Leave (Sibling)': t('leaveRequest', 'hint_bereavement'),
    'Maternity Leave (Prenatal)': t('leaveRequest', 'hint_medical'),
    'Maternity Leave (Postnatal)': t('leaveRequest', 'hint_birth'),
    'Birth Assistance Leave': t('leaveRequest', 'hint_birth'),
  };

  const leaveTypeOptions = [
    { value: 'Annual Leave', labelKey: 'annualLeave' },
    { value: 'Paternity Leave', labelKey: 'paternityLeave' },
    { value: 'Sick Leave', labelKey: 'sickLeave' },
    { value: 'Marriage Leave', labelKey: 'marriageLeave' },
    { value: 'Bereavement Leave', labelKey: 'bereavementLeave' },
    { value: 'Bereavement Leave (Sibling)', labelKey: 'bereavementSibling' },
    { value: 'Maternity Leave (Prenatal)', labelKey: 'maternityPrenatal' },
    { value: 'Maternity Leave (Postnatal)', labelKey: 'maternityPostnatal' },
    { value: 'Nursing Leave', labelKey: 'nursingLeave' },
    { value: 'Birth Assistance Leave', labelKey: 'birthAssistance' },
    { value: 'Unpaid Leave', labelKey: 'unpaidLeave' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || !days) return;

    // Resolve name from email prefix or eis_users directory
    let empName = email ? email.split('@')[0] : 'Employee';
    const savedUsers = localStorage.getItem('eis_users');
    if (savedUsers && email) {
      try {
        const usersList = JSON.parse(savedUsers);
        const found = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          empName = found.name;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Create request object
    const newReq = {
      id: Date.now().toString(),
      employee: empName,
      email: email || 'employee@eis.com',
      type: type,
      start: start,
      end: end,
      days: days,
      description: description,
      status: 'pending_manager',
    };

    // Load existing requests
    let queue = [];
    const savedQueue = localStorage.getItem('eis_leave_requests');
    if (savedQueue) {
      try {
        queue = JSON.parse(savedQueue);
      } catch (err) {
        console.error(err);
      }
    }

    // Append and save
    queue.push(newReq);
    localStorage.setItem('eis_leave_requests', JSON.stringify(queue));

    // Trigger notification for manager
    let notifsList = [];
    const savedNotifs = localStorage.getItem('eis_notifications');
    if (savedNotifs) {
      try {
        notifsList = JSON.parse(savedNotifs);
      } catch (e) {
        console.error(e);
      }
    }
    const newNotif = {
      id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      email: 'manager@eis.com',
      title: 'New Leave Request Submitted',
      message: `${empName} (${email || 'employee@eis.com'}) submitted a request for ${days} days (${type}).`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      link: '/manager/approvals'
    };
    notifsList.unshift(newNotif);
    localStorage.setItem('eis_notifications', JSON.stringify(notifsList));
    window.dispatchEvent(new Event('eis_notification_update'));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    // Reset form fields
    setStart('');
    setEnd('');
    setDescription('');
    setDocFile(null);
  };

  if (!role) return null;

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
    
        .form-card {
          background-color: var(--bg-card, #ffffff);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 650px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .form-control {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background-color: var(--bg-card, #ffffff);
          transition: all 0.2s;
        }

        .form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .dates-row {
          display: flex;
          gap: 16px;
          width: 100%;
        }

        .dates-row .form-group {
          flex: 1;
        }

        /* Summary box for calculated days */
        .summary-box {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 20px;
        }

        /* File Upload */
        .file-upload-container {
          border: 1.5px dashed #cbd5e1;
          border-radius: 8px;
          padding: 14px;
          text-align: center;
          background-color: #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
        }

        .file-upload-container:hover {
          border-color: #3b82f6;
          background-color: #eff6ff40;
        }

        .upload-hint {
          font-size: 12px;
          color: #2563eb;
          margin-top: 6px;
          font-weight: 500;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #16a34a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
          box-shadow: 0 2px 4px rgba(22, 163, 74, 0.15);
        }

        .submit-btn:hover {
          background-color: #15803d;
        }

        /* Success banner */
        .success-banner {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 14px;
          border-radius: 8px;
          margin-top: 20px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      ` }} />

      <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('leaveRequest', 'title')}</h2>
          <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
            {t('leaveRequest', 'description')}
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Leave type */}
            <div className="form-group">
              <label htmlFor="leaveType">{t('leaveRequest', 'leaveType')}</label>
              <CustomSelect
                id="leaveType"
                value={type}
                onChange={setType}
                options={leaveTypeOptions.map(opt => ({
                  value: opt.value,
                  label: t('leaveRequest', opt.labelKey as any) || opt.value
                }))}
              />
            </div>

            {/* Dates */}
            <div className="dates-row">
              <div className="form-group">
                <label htmlFor="startDate">{t('leaveRequest', 'startDate')}</label>
                <input
                  id="startDate"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">{t('leaveRequest', 'endDate')}</label>
                <input
                  id="endDate"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
            </div>

            {/* Working days counter */}
            <div className="summary-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{t('leaveRequest', 'calculatedPeriod').replace('{days}', days.toString())}</span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">{t('leaveRequest', 'descriptionLabel')}</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t('leaveRequest', 'descriptionPlaceholder')}
                className="form-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Conditional document upload */}
            {needsDocument && (
              <div className="form-group">
                <label htmlFor="document">{t('leaveRequest', 'supportingDoc')}</label>
                <div className="file-upload-container" onClick={() => window.document.getElementById('document')?.click()}>
                  <input
                    id="document"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>{docFile ? docFile.name : t('leaveRequest', 'selectDoc')}</span>
                  </div>
                  <p className="upload-hint">{hintMap[type]}</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="submit-btn">
              {t('leaveRequest', 'submitBtn')}
            </button>

            {showSuccess && (
              <div className="success-banner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{t('leaveRequest', 'successMessage')}</span>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
