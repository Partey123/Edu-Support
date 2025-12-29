import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserPresenceProvider } from "@/contexts/UserPresenceContext";
import { VideoStreamProvider } from "@/contexts/VideoStreamContext";
import { VirtualClassProvider } from "@/contexts/VirtualClassContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SchoolActivation from "./pages/SchoolActivation";
import SchoolInactivePage from "./pages/SchoolInactive";
import NotFound from "./pages/NotFound";


// Subscription Pages
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import SubscriptionVerify from "./pages/SubscriptionVerify";

// Super Admin Pages
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import SchoolsPage from "./pages/super-admin/Schools";
import SchoolDetailsPage from "./pages/super-admin/SchoolDetails";
import SchoolEditPage from "./pages/super-admin/SchoolEdit";
import AnalyticsPage from "./pages/super-admin/Analytics";
import SuperAdminSettingsPage from "./pages/super-admin/Settings";
import PlansPage from "./pages/super-admin/Plans";
import PlanDetail from "./pages/super-admin/PlanDetail";
import CodesPage from "./pages/super-admin/Codes";
import SuperAdminStudentsPage from "./pages/super-admin/Students";
import SuperAdminClassesPage from "./pages/super-admin/Classes";
import SuperAdminTeachersPage from "./pages/super-admin/Teachers";

// School Admin Pages
import SchoolAdminDashboard from "./pages/school-admin/Dashboard";
import StudentsPage from "./pages/school-admin/Students";
import TeachersPage from "./pages/school-admin/Teachers";
import TeacherDetailPage from "./pages/school-admin/TeacherDetail";
import ClassesPage from "./pages/school-admin/Classes";
import SubjectsPage from "./pages/school-admin/Subjects";
import AttendancePage from "./pages/school-admin/Attendance";
import ReportsPage from "./pages/school-admin/Reports";
import SchoolSettingsPage from "./pages/school-admin/Settings";
import ClassDetailPage from "./pages/school-admin/ClassDetail";
import StudentDetailPage from "./pages/school-admin/StudentDetail";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherClassDetail from "./pages/teacher/ClassDetail";
import TeacherReports from "./pages/teacher/Reports";
import TeacherStudents from "./pages/teacher/Students";
import TeacherVirtualClass from "./pages/teacher/VirtualClass";

// Parent Pages
import ParentDashboard from "./pages/parent/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/school/activation" element={
              <ProtectedRoute allowedRoles={['school_admin']}>
              <SchoolActivation />
              </ProtectedRoute>
              } />
              <Route path="/school-inactive" element={<SchoolInactivePage />} />

              {/* Subscription Routes - Checkout is PUBLIC, Verify requires auth */}
              <Route path="/subscription/checkout" element={<SubscriptionCheckout />} />
              <Route path="/subscription/verify" element={
                <ProtectedRoute allowedRoles={['super_admin', 'school_admin']}>
                  <SubscriptionVerify />
                </ProtectedRoute>
              } />

              {/* Super Admin Routes */}
              <Route path="/super-admin/dashboard" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/schools" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SchoolsPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/schools/:id" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SchoolDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/schools/:id/edit" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SchoolEditPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/schools/:id/students" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminStudentsPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/schools/:id/teachers" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminTeachersPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/schools/:id/classes" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminClassesPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/analytics" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/settings" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/plans" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <PlansPage />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/plans/:id" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <PlanDetail />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/codes" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <CodesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/students" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminStudentsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/classes" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminClassesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/teachers" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminTeachersPage />
                </ProtectedRoute>
              } />

              {/* School Admin Routes */}
              <Route path="/school-admin/activate" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <SchoolActivation />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/dashboard" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <SchoolAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/students" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <StudentsPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/teachers" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <TeachersPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/teachers/:id" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <TeacherDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/classes" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <ClassesPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/classes/:classId" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <ClassDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/students/:studentId" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <StudentDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/subjects" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <SubjectsPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/attendance" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <AttendancePage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/reports" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <ReportsPage />
                </ProtectedRoute>
              } />
              <Route path="/school-admin/settings" element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <SchoolSettingsPage />
                </ProtectedRoute>
              } />

              {/* Teacher Routes */}
              <Route path="/teacher/dashboard" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/teacher/classes" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherClasses />
                </ProtectedRoute>
              } />
              <Route path="/teacher/class/:id" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherClassDetail />
                </ProtectedRoute>
              } />
              <Route path="/teacher/students" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherStudents />
                </ProtectedRoute>
              } />
              <Route path="/teacher/reports" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherReports />
                </ProtectedRoute>
              } />
              <Route path="/teacher/virtual-class" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherVirtualClass />
                </ProtectedRoute>
              } />
              <Route path="/teacher/virtual-class/:id" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherVirtualClass />
                </ProtectedRoute>
              } />

              {/* Parent Routes */}
              <Route path="/parent/dashboard" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/children" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/attendance" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/grades" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/reports" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/payments" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;