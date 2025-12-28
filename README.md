# 🎓 EduSupport - School Management System for Ghana

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Developer](https://img.shields.io/badge/Developer-Boakye%20Hassan%20Agyemang-orange)

A comprehensive school management system built for Ghanaian basic schools. EduSupport provides powerful tools for student management, attendance tracking, grading, virtual classrooms, and comprehensive reporting.

**👨‍💻 Developer**: Boakye Hassan Agyemang

## ✨ Features

- 👥 **Student Management** - Complete student profile management with enrollment tracking
- 📋 **Attendance Tracking** - Real-time attendance management and reporting
- 📊 **Grading System** - Integrated grading with transcript generation
- 🎥 **Virtual Classroom** - Live video classes powered by Agora
- 💳 **Payment Integration** - Secure subscription handling via Paystack
- 📈 **Dashboard Analytics** - Comprehensive school analytics and statistics
- 🔐 **Multi-Role Support** - Teacher, Parent, School Admin, and Super Admin interfaces
- 🏫 **Class Management** - Organize and manage classes effectively
- 📅 **Academic Terms** - Structured academic calendar management

## 🛠️ Tech Stack

- ⚛️ **Frontend** - React 18 with TypeScript
- 🎨 **UI Framework** - Shadcn/ui with Tailwind CSS
- 🗄️ **Backend** - Supabase (PostgreSQL)
- 🔑 **Authentication** - Supabase Auth
- 📹 **Video Streaming** - Agora RTC SDK
- 💰 **Payments** - Paystack Integration
- ⚡ **Build Tool** - Vite
- 🛣️ **Routing** - React Router v6

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v18+)
- npm or bun package manager

### 📦 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd final\ school
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with your Supabase and Paystack credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 💻 Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### 🏗️ Build

Build for production:
```bash
npm run build
```

### 👀 Preview

Preview the production build:
```bash
npm run preview
```

## 📂 Project Structure

```
src/
├── components/       # 🧩 Reusable UI components
├── pages/           # 📄 Page components
├── hooks/           # 🪝 Custom React hooks
├── services/        # 🔧 API services (Supabase, Agora, Paystack)
├── contexts/        # 🌍 React contexts for global state
├── types/           # 📝 TypeScript type definitions
├── lib/             # 📚 Utilities and helpers
└── integrations/    # 🔗 Third-party integrations
```

## 📖 Key Features Documentation

### 🎥 Virtual Classroom
- Real-time video communication using Agora
- Screen sharing capabilities
- Session recording
- Network quality monitoring

### 💳 Payment System
- Subscription management via Paystack
- Annual and monthly plans
- Payment verification
- Transaction history

### 🔐 Authentication
- Email/password signup
- Role-based access control
- Protected routes
- Session management

## 🤝 Contributing

This is a personal project. For inquiries or collaboration requests, please contact the developer.

## 📄 License

© 2025 Boakye Hassan Agyemang. All rights reserved.

## 📧 Contact

**👨‍💻 Developer**: Boakye Hassan Agyemang

For questions or feedback about EduSupport, please reach out directly.

---

<div align="center">

**Built with ❤️ for Ghanaian Schools**

Made by Boakye Hassan Agyemang

</div>
