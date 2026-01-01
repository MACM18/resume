# 🚀 MACM.dev | Personal Portfolio & Resume Engine

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

A high-performance, AI-powered personal portfolio and resume management system built with the latest web technologies. Designed for developers who want a professional, dynamic, and highly customizable web presence.

🌐 **Live:** [https://macm.dev](https://macm.dev)

---

## ✨ Key Features

### 🎨 Immersive UI/UX

- **Glassmorphism Design:** A modern, sleek aesthetic with subtle transparency and blur effects.
- **Dynamic Parallax:** Multi-layered parallax scrolling for a deep, immersive hero section.
- **Theme Engine:** Domain-driven theming that allows for unique colors, backgrounds, and favicons per deployment.
- **Responsive & Fluid:** Built with Tailwind CSS and Framer Motion for buttery-smooth transitions on any device.

### 🤖 AI-Powered Intelligence

- **Smart Summaries:** Leverages **Groq AI** to generate professional resume summaries and project descriptions.
- **Feature Extraction:** Automatically identifies and highlights key technical features from project descriptions.
- **Content Optimization:** AI-assisted about-me card generation to make your profile stand out.

### 📄 Resume Management

- **Dynamic PDF Generation:** Create professional PDF resumes on-the-fly using \`@react-pdf/renderer\`.
- **Multi-Role Support:** Manage different resume versions for different job roles.
- **Upload & Host:** Support for hosting existing PDF resumes with secure storage.

### 🛠️ Admin Control Center

- **Full Profile Management:** Edit your bio, tagline, and social links with ease.
- **Project Showcase:** A robust system to manage, feature, and publish your work.
- **Real-time Preview:** See your changes instantly as you customize your portfolio's look and feel.

---

## 🛠️ Tech Stack

| Layer              | Technology                                                                                 |
| :----------------- | :----------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js 15 (App Router)](https://nextjs.org/)                                             |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                                              |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) |
| **Database**       | [PostgreSQL](https://www.postgresql.org/)                                                  |
| **ORM**            | [Prisma 6](https://www.prisma.io/)                                                         |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/)                                                   |
| **AI Engine**      | [Groq SDK](https://groq.com/)                                                              |
| **Email**          | [Resend](https://resend.com/)                                                              |
| **UI Components**  | [Shadcn UI](https://ui.shadcn.com/) (Radix UI)                                             |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Groq API Key (for AI features)
- Resend API Key (for emails)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MACM18/resume.git
   cd resume
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root and add your credentials:

   ```env
   DATABASE_URL="your_postgresql_url"
   NEXTAUTH_SECRET="your_secret"
   GROQ_API_KEY="your_groq_key"
   RESEND_API_KEY="your_resend_key"
   ```

4. **Database Migration:**

   ```bash
   pnpm db:migrate
   ```

5. **Run Development Server:**
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see your portfolio in action!

---

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by [MACM](https://macm.dev)
