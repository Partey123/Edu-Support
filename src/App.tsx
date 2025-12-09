import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/dashboard/Students";
import Teachers from "./pages/dashboard/Teachers";
import Classes from "./pages/dashboard/Classes";
import Attendance from "./pages/dashboard/Attendance";
import Timetable from "./pages/dashboard/Timetable";
import Finance from "./pages/dashboard/Finance";
import Library from "./pages/dashboard/Library";
import Transport from "./pages/dashboard/Transport";
import Communication from "./pages/dashboard/Communication";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import VirtualClass from "./pages/dashboard/VirtualClass";
import QRScanner from "./pages/dashboard/QRScanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/students" element={<Students />} />
            <Route path="/dashboard/teachers" element={<Teachers />} />
            <Route path="/dashboard/classes" element={<Classes />} />
            <Route path="/dashboard/virtual-class" element={<VirtualClass />} />
            <Route path="/dashboard/attendance" element={<Attendance />} />
            <Route path="/dashboard/timetable" element={<Timetable />} />
            <Route path="/dashboard/finance" element={<Finance />} />
            <Route path="/dashboard/library" element={<Library />} />
            <Route path="/dashboard/transport" element={<Transport />} />
            <Route path="/dashboard/communication" element={<Communication />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/qr-scanner" element={<QRScanner />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
