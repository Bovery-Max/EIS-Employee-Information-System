# 🏢 Employee Information System (EIS)

A modern, highly interactive, and responsive Employee Information System built with Next.js. This platform serves as a centralized hub for organizations to manage employees, track leave requests, configure company hierarchies, and handle role-based dashboards seamlessly.

## 🌟 Key Features

- **🛡️ Role-Based Access Control:** Dedicated dashboards and customized views for `Admin`, `HR`, `Manager`, and `Employee` roles.
- **🏝️ Advanced Leave Management:** Employees can request time off, while Managers and HR can approve/reject requests. Includes automated leave balance tracking and detailed history logs.
- **🌳 Dynamic Organization Chart:** A visual and interactive company hierarchy tree. Support for infinite depth (e.g., CEO ➔ Vice CEO ➔ Engineering/HR Managers ➔ Employees) with dynamic parent node assignment capabilities.
- **🎨 Premium UI/UX:** Built with modern design principles. Includes smooth glassmorphism effects, dynamic micro-animations, custom dropdowns, and beautifully crafted tables.
- **🌓 Dark & Light Mode:** Seamless theme switching with persistent user preference handling. Hover states and background aesthetics are perfectly tailored for both modes.
- **🚀 Fully Static Export:** Configured to be statically exported and easily deployable on **GitHub Pages** with automated GitHub Actions.

## 🛠️ Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS for custom micro-animations
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Context API & `localStorage` (Mock Database for Frontend Showcase)
- **Deployment:** GitHub Pages & GitHub Actions

## 🚀 Getting Started (Local Development)

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/Bovery-Max/EIS-Employee-Information-System.git
cd EISproject
npm install
