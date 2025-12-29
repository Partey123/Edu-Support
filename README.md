

[![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![Powered by Vite](https://img.shields.io/badge/powered_by-Vite-purple.svg)](https://vitejs.dev)

A comprehensive educational management and virtual classroom platform designed to streamline school administration, facilitate real-time virtual classes, and enhance student engagement. Built with modern web technologies for scalability, performance, and user experience.

## 🎯 Overview

EduSupport Ghana is a full-stack educational technology solution that enables schools to manage academic operations, conduct virtual classes, track student progress, and process subscriptions seamlessly. The platform supports multiple user roles (Super Admin, School Admin, Teachers, Parents) with role-based access control and specialized dashboards.

### Key Features

- **🔐 Multi-Role Authentication**: Hierarchical user management with role-based access control
- **📊 School Administration**: Manage students, teachers, classes, subjects, and academic terms
- **📹 Virtual Classroom**: Real-time video conferencing powered by Agora SDK
- **📋 Attendance Tracking**: Mark and monitor student attendance with detailed records
- **📈 Analytics & Reports**: Comprehensive dashboards and reporting capabilities
- **💳 Subscription Management**: Integrated payment processing with Paystack
- **👥 User Presence**: Real-time presence tracking for online status
- **🎓 Grade Management**: Track and manage student grades and academic performance

## 🏗️ Architecture

### Technology Stack

**Frontend**
- **React 18+** - UI component library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

**Backend & Services**
- **Supabase** - PostgreSQL database with real-time capabilities
- **Agora SDK** - Real-time video/audio communication
- **Paystack API** - Payment processing
- **Deno** - Server runtime (optional edge functions)

**Development Tools**
- **ESLint** - Code quality and linting
- **PostCSS** - CSS preprocessing
- **Form Validation** - React Hook Form + Zod
- **UI Notifications** - Sonner & Radix Toast

## 📁 Project Structure

### Pages (`src/pages/`)

The application is organized into distinct pages for different user roles:

#### Public Pages
- **`Index.tsx`** - Landing page with features, pricing, and testimonials
- **`Login.tsx`** - User authentication page
- **`Signup.tsx`** - New user registration
- **`SubscriptionCheckout.tsx`** - Payment checkout flow
- **`SubscriptionVerify.tsx`** - Payment verification
- **`SchoolActivation.tsx`** - School activation workflow
- **`SchoolInactive.tsx`** - Inactive school status page
- **`NotFound.tsx`** - 404 error page

#### Super Admin Pages (`super-admin/`)
Comprehensive platform administration interface:
- **`Dashboard.tsx`** - Overview of all schools, users, and system health
- **`Schools.tsx`** - List and manage all registered schools
- **`SchoolDetails.tsx`** - View detailed school information
- **`SchoolEdit.tsx`** - Edit school profile and settings
- **`Analytics.tsx`** - System-wide analytics and metrics
- **`Settings.tsx`** - Platform configuration and preferences
- **`Plans.tsx`** - Subscription plan management
- **`PlanDetail.tsx`** - Individual plan configuration
- **`Codes.tsx`** - Activation code generation and management
- **`Students.tsx`** - System-wide student view
- **`Teachers.tsx`** - System-wide teacher management
- **`Classes.tsx`** - System-wide class overview

#### School Admin Pages (`school-admin/`)
School-specific administration interface:
- **`Dashboard.tsx`** - School overview with key metrics
- **`Students.tsx`** - Student enrollment and management
- **`StudentDetail.tsx`** - Individual student profile
- **`Teachers.tsx`** - Teacher roster and assignments
- **`TeacherDetail.tsx`** - Individual teacher profile
- **`Classes.tsx`** - Class creation and management
- **`ClassDetail.tsx`** - Class information and enrolled students
- **`Subjects.tsx`** - Subject catalog and assignments
- **`Attendance.tsx`** - Student attendance marking and records
- **`Grades.tsx`** - Grade entry and transcript management
- **`Reports.tsx`** - Academic and administrative reports
- **`Settings.tsx`** - School-specific settings

#### Teacher Pages (`teacher/`)
Instructor-focused interface:
- **`Dashboard.tsx`** - Personal teaching dashboard
- **`Classes.tsx`** - Assigned classes overview
- **`ClassDetail.tsx`** - Class details and student roster
- **`Students.tsx`** - Student list and management
- **`Attendance.tsx`** - Attendance marking for classes
- **`Grades.tsx`** - Grade entry and management
- **`Reports.tsx`** - Class reports and analytics
- **`VirtualClass.tsx`** - Virtual classroom interface
- **`Settings.tsx`** - Personal settings

#### Parent Pages (`parent/`)
Parent/Guardian interface:
- **`Dashboard.tsx`** - Child's academic overview
- **`Children.tsx`** - Manage linked children accounts
- **`AcademicProgress.tsx`** - View grades and progress
- **`Attendance.tsx`** - Child's attendance records
- **`Communications.tsx`** - Messages from teachers

## 🔧 Services (`src/services/`)

Core business logic and API integration layer:

### Authentication & Authorization
- **`tokenService.ts`** - JWT token management and validation
  - Token generation, refresh, and validation
  - Secure token storage and expiration handling

### Academic Management
- **`enrollmentService.ts`** - Student enrollment operations
  - Enroll/unenroll students in classes
  - Manage enrollment status and lifecycle
  - Handle transfers and withdrawals

- **`attendanceService.ts`** - Attendance tracking
  - Mark attendance records
  - Retrieve attendance history
  - Generate attendance reports

- **`gradeService.ts`** - Grade management
  - Record student grades
  - Calculate GPA and statistics
  - Export grade reports

- **`topupCodeService.ts`** - Subscription code management
  - Generate and validate activation codes
  - Track code usage and expiration
  - Manage subscription credits

### Virtual Classroom
- **`agoraService.ts`** - Agora SDK integration (517 lines)
  - Real-time video/audio streaming
  - User management (join/leave channels)
  - Media device control (camera, microphone)
  - Screen sharing capabilities
  - Recording functionality
  - Network quality monitoring
  - Event handling and callbacks

- **`videoSessionService.ts`** - Session management
  - Create and manage video sessions
  - Track session state and participants
  - Handle session recording metadata

### Subscription & Payments
- **`subscriptionService.ts`** - Subscription management (263 lines)
  - Retrieve subscription plans
  - Manage school subscriptions
  - Track billing cycles and renewals
  - Handle subscription status transitions

- **`paystackService.ts`** - Paystack payment integration
  - Initialize payment transactions
  - Verify payment status
  - Handle payment callbacks
  - Manage payment history

- **`subscriptionTimerService.ts`** - Subscription lifecycle
  - Monitor subscription expiration
  - Handle subscription renewal timing
  - Alert on upcoming renewals

## 🎣 Hooks (`src/hooks/`)

Custom React hooks providing reusable logic and state management:

### Authentication & Authorization
- **`useAuth.tsx`** (299 lines) - Core authentication context and logic
  - User login/signup/logout
  - Session management
  - Profile fetching and caching
  - Role determination and multi-role support
  - Automatic session restoration on app load
  - Real-time auth state synchronization
  ```typescript
  const { user, session, profile, roles, signIn, signOut } = useAuth();
  const isSuperAdmin = useAuth().isSuperAdmin;
  const hasRole = useAuth().hasRole('school_admin');
  ```

### Data Fetching & Management
- **`useSchoolData.ts`** (1584 lines) - Comprehensive school data operations
  - Query students, teachers, classes, subjects
  - Manage academic terms
  - Handle enrollment operations
  - Fetch dashboard statistics
  - Uses TanStack Query for caching and invalidation
  ```typescript
  const { data: students } = useSchoolData().students();
  const { data: stats } = useSchoolData().dashboardStats();
  const createStudent = useSchoolData().createStudent();
  ```

- **`useSuperAdminData.ts`** - Super admin specific data queries
  - Fetch all schools and users
  - Manage system-wide resources
  - Access analytics and reports

- **`useSubscription.tsx`** - Subscription state management
  - Current subscription details
  - Plan information
  - Subscription status and expiration

- **`useSubscriptionTimer.ts`** - Subscription countdown
  - Time until expiration
  - Auto-refresh on expiration

### Virtual Classroom
- **`useAgora.ts`** - Agora client initialization
  - Initialize Agora RTC client
  - Manage client configuration
  - Handle client lifecycle

- **`useAgoraSession.ts`** - Agora session management
  - Join/leave channels
  - Manage local and remote users
  - Handle event subscriptions

- **`useMediaDevices.ts`** - Media device enumeration
  - List available cameras and microphones
  - Device selection and switching
  - Permission handling

- **`useScreenShare.ts`** - Screen sharing functionality
  - Start/stop screen sharing
  - Screen share state management
  - UI state synchronization

- **`useRecording.ts`** - Recording functionality
  - Start/stop recording
  - Recording metadata
  - File management

- **`useVideoLayout.ts`** - Video grid layout management
  - Responsive grid layout
  - Speaker highlight mode
  - Picture-in-picture support

- **`useNetworkQuality.ts`** - Network monitoring
  - Real-time network quality metrics
  - Latency and bandwidth monitoring
  - Connection status indicators

### UI & Utilities
- **`useToast.ts`** - Toast notifications
  - Show success, error, info messages
  - Customizable appearance and duration

- **`use-mobile.tsx`** - Responsive design detection
  - Detect mobile viewport
  - Breakpoint-aware rendering
  - Device-specific logic

## 🔐 Authentication Flow

```
User Login → Supabase Auth → Profile Fetch → Role Determination
                                     ↓
                          Multi-Role Support
                          ├─ super_admin
                          ├─ school_admin
                          ├─ teacher
                          └─ parent

Protected Routes → Role Validation → Redirect or Allow Access
```

## 📊 Data Models

### User Hierarchy
```
User (Supabase Auth)
├─ Profile (user metadata, name, email)
├─ SchoolMembership (school association)
└─ Role (super_admin | school_admin | teacher | parent)
```

### Academic Structure
```
School
├─ AcademicTerms (years/terms)
├─ Classes (grade levels and sections)
│  └─ Enrollments (students per class)
│     └─ Attendance (daily records)
│        └─ Grades (per subject)
├─ Students
├─ Teachers
└─ Subjects
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Deno
- npm or pnpm package manager
- Supabase account
- Agora SDK credentials
- Paystack API keys

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/edu-support.git
cd edu-support

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Setup

Create `.env.local` with required variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_AGORA_APP_ID=your_agora_app_id
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key
```

## 🛠️ Development

### Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Quality

- **ESLint** configured for TypeScript and React
- **Prettier** for code formatting
- Type-safe development with TypeScript

## 📦 Service Patterns

### Query Pattern (TanStack Query)
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['students', schoolId],
  queryFn: () => fetchStudents(schoolId),
});
```

### Mutation Pattern
```typescript
const { mutate: createStudent } = useMutation({
  mutationFn: (data) => enrollmentService.createStudent(data),
  onSuccess: () => queryClient.invalidateQueries(['students']),
});
```

### Hook Composition
```typescript
// Combine multiple hooks for complex operations
const { data: students } = useSchoolData();
const { user } = useAuth();
const { toast } = useToast();
```

## 🔗 API Integration

### Supabase
- Real-time database subscriptions
- Authentication and authorization
- File storage for documents/media
- Edge functions for server logic

### Agora
- Real-time video/audio communication
- Automatic token generation
- Network quality monitoring
- Recording capabilities

### Paystack
- Secure payment processing
- Multiple payment methods
- Transaction verification
- Webhook handling

## 📈 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Query Caching**: TanStack Query optimization
- **Asset Optimization**: Vite bundling and minification
- **Responsive Images**: Tailwind CSS responsive utilities
- **Real-time Updates**: Supabase subscriptions

## 🎨 UI Components

Built with Radix UI primitives and Tailwind CSS:
- Accessible dialogs, forms, and navigation
- Toast notifications with Sonner
- Command palette with cmdk
- Responsive design with mobile-first approach
- Dark mode support with next-themes

## 🔄 State Management

### Context API
- `UserPresenceContext` - Track online status
- `VideoStreamContext` - Manage video streams
- `VirtualClassContext` - Virtual classroom state

### TanStack Query
- Automatic caching and synchronization
- Background refetching
- Optimistic updates
- Query invalidation

## 🛡️ Security Features

- **JWT Token Management**: Secure session handling
- **Role-Based Access Control**: Page and feature-level protection
- **Supabase RLS**: Row-level security policies
- **Environment Variables**: Sensitive data separation

## 📱 Responsive Design

Mobile-first approach with breakpoints:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@edusupport.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Assignment and homework module
- [ ] Parent-teacher messaging
- [ ] SMS notifications
- [ ] Offline mode
- [ ] Multi-language support
- [ ] API documentation and SDK

## 👥 Team

Developed with ❤️ by the EduSupport Ghana team.

---

**Version**: 0.0.0  
**Last Updated**: December 2025  
**Status**: Active Development
