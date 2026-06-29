'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { useLanguage } from '../../context/LanguageContext';

interface Notification {
  id: string;
  email: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  // Load notifications matching user's email
  useEffect(() => {
    if (email && typeof window !== 'undefined') {
      const saved = localStorage.getItem('eis_notifications');
      if (saved) {
        try {
          const list: Notification[] = JSON.parse(saved);
          const userNotifications = list.filter(
            (n) => n.email.toLowerCase() === email.toLowerCase()
          );
          // Sort by timestamp descending (newest first)
          userNotifications.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          setNotifications(userNotifications);
        } catch (e) {
          console.error('Error loading notifications', e);
        }
      }
      setLoaded(true);
    }
  }, [email]);

  if (!role || !loaded) return null;

  // Mark a single notification as read
  const handleMarkAsRead = (id: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eis_notifications');
      if (saved) {
        try {
          const list: Notification[] = JSON.parse(saved);
          const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
          localStorage.setItem('eis_notifications', JSON.stringify(updated));
          
          // Update local state
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );

          // Dispatch event to update sidebar
          window.dispatchEvent(new Event('eis_notification_update'));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // Click handler to redirect
  const handleNotificationClick = (item: Notification) => {
    handleMarkAsRead(item.id);
    if (item.link) {
      router.push(item.link);
    }
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    if (email && typeof window !== 'undefined') {
      const saved = localStorage.getItem('eis_notifications');
      if (saved) {
        try {
          const list: Notification[] = JSON.parse(saved);
          const updated = list.map((n) =>
            n.email.toLowerCase() === email.toLowerCase() ? { ...n, read: true } : n
          );
          localStorage.setItem('eis_notifications', JSON.stringify(updated));
          
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          
          window.dispatchEvent(new Event('eis_notification_update'));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (email && typeof window !== 'undefined') {
      const saved = localStorage.getItem('eis_notifications');
      if (saved) {
        try {
          const list: Notification[] = JSON.parse(saved);
          // Keep notifications for OTHER users, delete this user's notifications
          const updated = list.filter((n) => n.email.toLowerCase() !== email.toLowerCase());
          localStorage.setItem('eis_notifications', JSON.stringify(updated));
          
          setNotifications([]);
          
          window.dispatchEvent(new Event('eis_notification_update'));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const translateNotification = (title: string, message: string) => {
    if (lang !== 'tr') return { title, message };

    let tTitle = title;
    if (title === 'New Leave Request Submitted') tTitle = 'Yeni İzin Talebi Gönderildi';
    else if (title === 'Leave Request Approved') tTitle = 'İzin Talebi Onaylandı';
    else if (title === 'Leave Request Rejected') tTitle = 'İzin Talebi Reddedildi';
    else if (title === 'Leave Request Rejected by HR') tTitle = 'İzin Talebi İK Tarafından Reddedildi';
    else if (title === 'Leave Request Approved by Manager') tTitle = 'İzin Talebi Yönetici Tarafından Onaylandı';
    else if (title === 'Leave Request Approved by HR') tTitle = 'İzin Talebi İK Tarafından Onaylandı';

    let tMessage = message;
    
    // Replace names
    tMessage = tMessage.replace(/Employee User/g, 'Çalışan Kullanıcı')
                       .replace(/Manager User/g, 'Yönetici Kullanıcı')
                       .replace(/HR User/g, 'İK Kullanıcısı')
                       .replace(/Admin User/g, 'Sistem Yöneticisi');

    // Replace leave types inside parentheses
    tMessage = tMessage.replace(/\(Bereavement Leave\)/g, '(Vefat İzni)')
                       .replace(/\(Annual Leave\)/g, '(Yıllık İzin)')
                       .replace(/\(Sick Leave\)/g, '(Hastalık İzni)')
                       .replace(/\(Marriage Leave\)/g, '(Evlilik İzni)')
                       .replace(/\(Casual Leave\)/g, '(Mazeret İzni)');

    // "Manager approved <Name>'s request for X days (<Type>). Awaiting your review."
    const mgrApproveMatch = tMessage.match(/Manager approved (.*?)'s request for (\d+) days (.*?)\. Awaiting your review\./);
    if (mgrApproveMatch) {
      tMessage = `Yönetici ${mgrApproveMatch[1]} kullanıcısının ${mgrApproveMatch[2]} günlük ${mgrApproveMatch[3]} talebini onayladı. İncelemenizi bekliyor.`;
    }

    // "<Name> (<Email>) submitted a request for X days (<Type>)."
    const submitMatch = tMessage.match(/(.*?) \((.*?)\) submitted a request for (\d+) days (.*?)\./);
    if (submitMatch) {
      tMessage = `${submitMatch[1]} (${submitMatch[2]}) ${submitMatch[3]} gün ${submitMatch[4]} talep etti.`;
    }

    // "Your leave request for X days (<Type>) was approved by (.*?)\."
    const approveMatch = tMessage.match(/Your leave request for (\d+) days (.*?) was approved by (.*?)\./);
    if (approveMatch) {
      const approver = approveMatch[3] === 'Manager' ? 'Yönetici' : (approveMatch[3] === 'HR' ? 'İK' : approveMatch[3]);
      tMessage = `${approveMatch[1]} günlük ${approveMatch[2]} talebiniz ${approver} tarafından onaylandı.`;
    }

    // "Your request for X days (<Type>) was approved by the manager and forwarded to HR."
    const mgrForwardMatch = tMessage.match(/Your request for (\d+) days (.*?) was approved by the manager and forwarded to HR\./);
    if (mgrForwardMatch) {
      tMessage = `${mgrForwardMatch[1]} günlük ${mgrForwardMatch[2]} talebiniz yönetici tarafından onaylandı ve İK'ya iletildi.`;
    }

    // "Your leave request for X days (<Type>) was rejected by (.*?)\."
    const rejectMatch = tMessage.match(/Your leave request for (\d+) days (.*?) (?:was|has been) rejected by (.*?)\./);
    if (rejectMatch) {
      const rejector = rejectMatch[3] === 'Manager' ? 'Yönetici' : (rejectMatch[3] === 'HR' ? 'İK' : rejectMatch[3]);
      tMessage = `${rejectMatch[1]} günlük ${rejectMatch[2]} talebiniz ${rejector} tarafından reddedildi.`;
    }

    return { title: tTitle, message: tMessage };
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar role={role} currentPath="/notifications" />

      {/* Styled Notifications Center */}
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
    
        .notifications-wrapper {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 850px;
          overflow: hidden;
        }

        .header-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .btn-secondary {
          padding: 8px 14px;
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary:hover {
          background-color: #eff6ff;
          border-color: #3b82f6;
          color: #2563eb;
        }

        .btn-danger {
          padding: 8px 14px;
          background-color: var(--bg-card, #ffffff);
          border: 1px solid #fee2e2;
          color: #dc2626;
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-danger:hover {
          background-color: #fef2f2;
          border-color: #fca5a5;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color, #f1f5f9);
          cursor: pointer;
          transition: background-color 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background-color: var(--bg-hover, #f8fafc);
        }

        .notification-item.unread {
          background-color: rgba(59, 130, 246, 0.08); /* Works for both modes */
        }

        .unread-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
          position: absolute;
          top: 24px;
          left: 10px;
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .item-title {
          font-weight: 700;
          color: var(--text-main, #1e293b);
          font-size: 14.5px;
        }

        .item-message {
          font-size: 13.5px;
          color: var(--text-muted, #64748b);
          margin-top: 4px;
        }

        .item-time {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 8px;
          font-weight: 500;
        }

        .action-arrow {
          align-self: center;
          color: #cbd5e1;
          font-size: 18px;
          transition: transform 0.2s;
        }

        .notification-item:hover .action-arrow {
          color: #2563eb;
          transform: translateX(3px);
        }
      ` }} />

      <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('notificationsPage', 'title')}</h2>
          <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
            {t('notificationsPage', 'description')}
          </p>
        </div>

        <div className="notifications-wrapper">
          <div className="header-controls">
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleMarkAllRead} className="btn-secondary" disabled={notifications.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t('notificationsPage', 'markAllRead')}
              </button>
              <button onClick={handleClearAll} className="btn-danger" disabled={notifications.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6h14M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                {t('notificationsPage', 'clearAll')}
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {t('notificationsPage', 'totalAlerts').replace('{count}', notifications.length.toString())}
            </div>
          </div>

          <div>
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`notification-item ${!item.read ? 'unread' : ''}`}
              >
                {!item.read && <div className="unread-bullet" />}
                
                <div className="avatar-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>

                <div className="item-details">
                  {(() => {
                    const translated = translateNotification(item.title, item.message);
                    return (
                      <>
                        <span className="item-title" style={{ fontWeight: !item.read ? 700 : 600 }}>{translated.title}</span>
                        <span className="item-message">{translated.message}</span>
                        <span className="item-time">{item.timestamp}</span>
                      </>
                    );
                  })()}
                </div>

                {item.link && (
                  <div className="action-arrow">➔</div>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 32px', color: '#64748b' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <div style={{ fontWeight: '600', fontSize: '15px', color: '#475569' }}>{t('notificationsPage', 'allCaughtUp')}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{t('notificationsPage', 'noNewNotifications')}</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
