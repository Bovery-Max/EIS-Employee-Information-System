<div align="center">

<img src="https://img.shields.io/badge/EIS-Employee%20Leave%20System-2563eb?style=for-the-badge&logoColor=white" alt="EIS Badge"/>

# 🏢 EIS — Employee Leave System

**A modern, role-based leave management system built for Turkish companies.**  
Compliant with Turkish Labor Law (İş Kanunu) · Clean UI · Multi-role approval workflow

[![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🚀 Getting Started](#-getting-started) · [👥 Demo Accounts](#-demo-accounts) · [🗂️ Project Structure](#️-project-structure)


</div>

---

## 🌐 Live Preview

You can check out the live version of the project here:
👉 **[EIS Live Preview](https://bovery-max.github.io/EIS-Employee-Information-System/)**

---

## 📋 Overview

EIS is a leave management system designed for Turkish companies. It supports the full leave lifecycle — from employee submission to manager approval and final HR sign-off — while staying compliant with Turkish Labor Law (*4857 Sayılı İş Kanunu*).

---

## ✨ Features

### 🔐 Role-Based Access Control
| Role | Capabilities |
|------|-------------|
| **Admin** | Full system access, organization tree, user management, leave type configuration |
| **HR** | Employee management, HR approval queue, audit logs, reports |
| **Manager** | Team approvals, approve or reject with optional rejection reason |
| **Employee** | Submit leave requests, view personal leave history and balance |
| **Guest** | Read-only view of leave history and new request form |

### 📅 Turkish Labor Law Compliant Leave Types
| Leave Type | Duration | Weekends | Document Required |
|------------|----------|----------|-------------------|
| Annual Leave (Yıllık İzin) | Min. 14 days/year | Excluded | No |
| Paternity Leave (Babalık İzni) | 5 working days | Excluded | Yes — Birth certificate |
| Sick Leave (Hastalık İzni) | Per medical report | Included | Yes — Medical report |
| Marriage Leave (Evlilik İzni) | 3 working days | Excluded | Yes — Marriage certificate |
| Bereavement 1st degree | 3 working days | Excluded | No |
| Bereavement 2nd degree | 2 working days | Excluded | No |

### 🔄 Approval Workflow
```
Employee Submits Request
        ↓
  [pending_manager]
        ↓
  Manager Reviews
   ↙         ↘
Reject      Approve
  ↓            ↓
rejected  [pending_hr]
               ↓
          HR Reviews
           ↙      ↘
        Reject   Approve
          ↓         ↓
       rejected  approved ✅
```

### 📊 Additional Features
- **Audit Logs** — Every system action is tracked and filterable
- **Organization Tree** — Visual company hierarchy management
- **Leave Balance Tracking** — With automatic year-end carryover
- **Document Upload** — Conditional based on leave type
- **Multilingual UI** — Turkish language support

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Bovery-Max/EIS-Employee-Information-System.git
cd EIS-Employee-Information-System

# Install dependencies
cd apps/web
npm install

# Start the development server
npx next dev
```

The app will be available at **http://localhost:3000**

---

## 👥 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@eis.com | admin123 | Admin |
| hr@eis.com | hr123 | HR |
| manager@eis.com | manager123 | Manager |
| employee@eis.com | emp123 | Employee |
| guest@eis.com | guest123 | Guest |

---

## 🗂️ Project Structure

```
EIS-Employee-Information-System/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── login/          # Login page
│   │   │   ├── dashboard/      # Role-based dashboard
│   │   │   ├── leave/
│   │   │   │   ├── new/        # New leave request form
│   │   │   │   └── history/    # Leave history
│   │   │   ├── manager/
│   │   │   │   └── approvals/  # Manager approval queue
│   │   │   ├── hr/
│   │   │   │   ├── approvals/  # HR approval queue
│   │   │   │   └── employees/  # Employee management
│   │   │   └── admin/
│   │   │       ├── organization/   # Org tree
│   │   │       ├── users/          # User management
│   │   │       ├── leave-types/    # Leave type configuration
│   │   │       └── audit-logs/     # System audit logs
│   │   └── components/
│   │       └── Sidebar.tsx     # Shared role-based sidebar
│   └── api/                    # Node.js + Express backend
└── packages/
    └── db/                     # Prisma schema + migrations
```

---

## 🎨 Design System

| Color | Hex | Usage |
|-------|-----|-------|
| 🔵 Blue | `#2563eb` | Primary actions, info, pending states |
| 🟢 Green | `#16a34a` | Approvals, success, active states |
| 🔴 Red | `#dc2626` | Rejections, errors, cancel |
| ⬛ Dark Navy | `#1e3a5f` | Sidebar background |
| ⬜ Light Gray | `#f9fafb` | Page background |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (HTTP-Only Cookie) |
| Monorepo | Turborepo |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ during internship · 2026

</div>
