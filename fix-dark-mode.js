const fs = require('fs');
const path = require('path');

const pages = [
  'app/admin/users/page.tsx',
  'app/admin/organization/page.tsx',
  'app/admin/leave-types/page.tsx',
  'app/admin/audit-logs/page.tsx',
  'app/leave/history/page.tsx',
  'app/leave/new/page.tsx',
  'app/notifications/page.tsx',
  'app/hr/employees/page.tsx',
  'app/hr/approvals/page.tsx',
  'app/manager/approvals/page.tsx',
];

const basePath = path.join(__dirname, 'apps/web');

for (const relPath of pages) {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace <main style={{ ... }}>
  content = content.replace(
    /<main style=\{\{\s*flexGrow:\s*1,\s*backgroundColor:\s*['"]#f9fafb['"],\s*padding:\s*['"]32px['"],\s*boxSizing:\s*['"]border-box['"]\s*\}\}>/g,
    '<main className="flex-1 p-8 text-slate-900 dark:text-slate-100">'
  );

  // For app/admin/users and others, replace h2 inline color if any
  content = content.replace(/<h2 style=\{\{\s*color:\s*['"]#1f2937['"]/g, '<h2 style={{ color: "inherit"');
  content = content.replace(/<p style=\{\{\s*color:\s*['"]#64748b['"]/g, '<p style={{ color: "var(--text-muted, #64748b)"');

  // Inject CSS variables for .dark
  if (content.includes('<style dangerouslySetInnerHTML=')) {
    const darkVars = `
        .dark {
          --bg-card: #1e293b;
          --bg-body: #0f172a;
          --border-color: #334155;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --bg-hover: #0f172a;
          --bg-input: #1e293b;
        }
        .dark .users-table-wrapper, .dark .modal-content, .dark .org-container, .dark .leave-card, .dark .history-container, .dark .notification-card {
          background-color: var(--bg-card);
          border-color: var(--border-color);
        }
        .dark .users-table th, .dark .history-table th, .dark .table-header-container, .dark .modal-header {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .dark .users-table tr, .dark .history-table tr {
          border-color: var(--border-color);
        }
        .dark .users-table tr:hover, .dark .history-table tr:hover {
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
    `;

    // Only inject once
    if (!content.includes('.dark {')) {
      content = content.replace(
        /(<style dangerouslySetInnerHTML=\{\{\s*__html:\s*`)/,
        `$1${darkVars}`
      );
    }
  }

  // Replace hardcoded #ffffff backgrounds with var
  content = content.replace(/background-color:\s*#ffffff;/g, 'background-color: var(--bg-card, #ffffff);');
  content = content.replace(/background:\s*#ffffff;/g, 'background: var(--bg-card, #ffffff);');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Updated ' + relPath);
}
