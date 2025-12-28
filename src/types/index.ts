// User types
export type UserRole = "super-admin" | "school-admin" | "teacher" | "parent";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

// School types
export interface School {
  id: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  students: number;
  teachers: number;
  status: "active" | "trial" | "inactive";
  plan: "Starter" | "Professional" | "Enterprise";
  createdAt: string;
}

// Student types
export interface Student {
  id: string;
  name: string;
  classId: string;
  className: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  age: number;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address?: string;
  status: "active" | "inactive" | "transferred" | "graduated";
  enrollmentDate: string;
  avatar?: string;
}

// Teacher types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female";
  subjects: string[];
  classes: string[];
  qualification: string;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  avatar?: string;
}

// Class types
export interface Class {
  id: string;
  name: string;
  level: string;
  section: string;
  classTeacherId?: string;
  classTeacherName?: string;
  studentCount: number;
  room?: string;
  academicYear: string;
}

// Subject types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  classes: string[];
}

// Attendance types
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
  markedAt: string;
}

// Grade types
export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  assessmentType: "class-test" | "mid-term" | "end-term" | "assignment" | "project";
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  term: string;
  academicYear: string;
  remarks?: string;
  enteredBy: string;
  enteredAt: string;
}

// Report types
export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  term: string;
  academicYear: string;
  grades: Grade[];
  attendance: {
    daysPresent: number;
    totalDays: number;
    percentage: number;
  };
  classTeacherRemarks?: string;
  headTeacherRemarks?: string;
  generatedAt: string;
}

// Payment types
export type PaymentStatus = "paid" | "pending" | "partial" | "overdue";

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  term: string;
  academicYear: string;
  paymentMethod?: string;
  reference?: string;
}

// Analytics types
export interface AnalyticsData {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  platformUptime: number;
}
