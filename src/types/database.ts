/**
 * Complete Database Type Definitions
 * Covers all entities needed for EduFlow school management system
 */

// ============ AUTHENTICATION & USER MANAGEMENT ============

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
  role: UserRole;
  school_id: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian' | 'transport_manager';

export interface Permission {
  id: string;
  role: UserRole;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete';
  school_id: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  ip_address: string;
  school_id: string;
  timestamp: string;
}

// ============ SCHOOL & ORGANIZATION ============

export interface School {
  id: string;
  name: string;
  motto: string;
  email: string;
  phone: string;
  website?: string;
  logo_url?: string;
  address: string;
  city: string;
  region: string;
  country: string;
  currency: string;
  education_system: 'ghana' | 'nigeria' | 'kenya' | 'south_africa' | 'custom';
  academic_year_start: number; // month (1-12)
  academic_year_end: number; // month (1-12)
  school_type: 'primary' | 'secondary' | 'mixed';
  principal_id: string;
  status: 'active' | 'inactive' | 'archived';
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_expires: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolTerm {
  id: string;
  school_id: string;
  term_name: 'term_1' | 'term_2' | 'term_3';
  academic_year: number; // e.g., 2024 for 2024/2025
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Holiday {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  created_at: string;
}

// ============ STUDENTS & ENROLLMENT ============

export interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_type?: string;
  photo_url?: string;
  current_class_id: string;
  enrollment_date: string;
  enrollment_status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'withdrawn';
  national_id?: string;
  religion?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  academic_year: number;
  enrollment_date: string;
  promotion_status: 'promoted' | 'repeated' | 'transferred' | 'not_promoted';
  created_at: string;
}

export interface StudentContact {
  id: string;
  student_id: string;
  contact_type: 'parent' | 'guardian' | 'emergency';
  full_name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  primary_contact: boolean;
  created_at: string;
}

export interface StudentHealthRecord {
  id: string;
  student_id: string;
  blood_type: string;
  allergies?: string;
  medical_conditions?: string;
  vaccination_status?: string;
  last_checkup_date?: string;
  notes?: string;
  updated_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  document_type: 'birth_certificate' | 'transfer_cert' | 'medical_form' | 'other';
  file_url: string;
  upload_date: string;
}

// ============ TEACHERS & STAFF ============

export interface Teacher {
  id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  national_id?: string;
  photo_url?: string;
  qualification: string;
  specialization: string;
  years_of_experience: number;
  employment_date: string;
  employment_status: 'active' | 'on_leave' | 'retired' | 'resigned' | 'terminated';
  employment_type: 'permanent' | 'contract' | 'temporary';
  department_id: string;
  class_teacher_of?: string; // class_id
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherQualification {
  id: string;
  teacher_id: string;
  qualification_name: string;
  institution: string;
  field_of_study: string;
  award_date: string;
  certificate_url?: string;
  created_at: string;
}

export interface TeacherLeave {
  id: string;
  teacher_id: string;
  leave_type: 'sick' | 'annual' | 'maternity' | 'sabbatical' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string; // user_id
  created_at: string;
}

export interface TeacherSalary {
  id: string;
  teacher_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  total_salary: number;
  payment_status: 'pending' | 'paid' | 'pending_approval';
  payment_date?: string;
  notes?: string;
  created_at: string;
}

// ============ CLASSES & SUBJECTS ============

export interface Class {
  id: string;
  class_code: string;
  class_name: string;
  form_level: string; // "Form 1", "Form 2", "Form 3", "Grade 8", etc.
  stream?: string; // "Gold", "Silver", "Blue", etc.
  class_teacher_id: string;
  academic_year: number;
  capacity: number;
  current_enrollment: number;
  room_number?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  subject_type: 'core' | 'elective' | 'extra_curricular';
  description?: string;
  school_id: string;
  created_at: string;
}

export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year: number;
  classes_per_week: number;
  credit_hours?: number;
}

export interface Department {
  id: string;
  department_name: string;
  department_code: string;
  head_id: string; // teacher_id
  description?: string;
  school_id: string;
  created_at: string;
}

// ============ TIMETABLE & SCHEDULING ============

export interface Timetable {
  id: string;
  class_id: string;
  academic_year: number;
  day_of_week: 0 | 1 | 2 | 3 | 4; // 0=Monday, 4=Friday
  period_number: number;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  subject_id: string;
  teacher_id: string;
  room_number?: string;
  created_at: string;
  updated_at: string;
}

export interface TimePeriod {
  id: string;
  period_number: number;
  period_name: string;
  start_time: string;
  end_time: string;
  school_id: string;
}

export interface ClassEvent {
  id: string;
  class_id?: string;
  event_name: string;
  event_type: 'holiday' | 'school_event' | 'exam' | 'activity' | 'assembly';
  start_date: string;
  end_date?: string;
  description?: string;
  location?: string;
  school_id: string;
  created_at: string;
}

// ============ ATTENDANCE ============

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string; // teacher_id/user_id
  reason?: string;
  created_at: string;
}

export interface TeacherAttendance {
  id: string;
  teacher_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  marked_by: string; // user_id (admin)
  reason?: string;
  created_at: string;
}

export interface AttendanceReport {
  id: string;
  student_id: string;
  academic_year: number;
  total_school_days: number;
  days_present: number;
  days_absent: number;
  days_late: number;
  attendance_percentage: number;
  generated_date: string;
}

// ============ ACADEMICS & EXAMINATIONS ============

export interface Subject_Exam {
  id: string;
  class_id: string;
  subject_id: string;
  exam_name: string; // "Term 1 Exam", "Mock Exam", etc.
  exam_type: 'formative' | 'summative' | 'mock' | 'final';
  start_date: string;
  end_date: string;
  total_marks: number;
  passing_marks: number;
  academic_year: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface ExamResult {
  id: string;
  student_id: string;
  exam_id: string;
  subject_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string; // A, B, C, D, E, F
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentReport {
  id: string;
  student_id: string;
  class_id: string;
  academic_year: number;
  term: 'term_1' | 'term_2' | 'term_3' | 'annual';
  class_position: number;
  total_marks: number;
  average_percentage: number;
  comments?: string;
  teacher_remarks?: string;
  principal_remarks?: string;
  generated_date: string;
}

export interface Assessment {
  id: string;
  class_id: string;
  subject_id: string;
  assessment_name: string;
  assessment_type: 'quiz' | 'assignment' | 'project' | 'class_work' | 'test';
  total_marks: number;
  due_date: string;
  created_by: string; // teacher_id
  created_at: string;
}

export interface StudentAssessmentScore {
  id: string;
  assessment_id: string;
  student_id: string;
  marks_obtained: number;
  submission_date?: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  feedback?: string;
  created_at: string;
}

// ============ FINANCE & PAYMENTS ============

export interface FeeStructure {
  id: string;
  school_id: string;
  academic_year: number;
  class_id?: string; // if null, applies to all classes
  fee_type: 'tuition' | 'registration' | 'activity' | 'transport' | 'meals' | 'uniform' | 'books' | 'other';
  amount: number;
  due_date: string;
  description?: string;
  created_at: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  school_id: string;
  academic_year: number;
  total_fees_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  due_date: string;
  payment_plan?: 'full' | 'installment';
  status: 'paid' | 'partial' | 'outstanding' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  student_fee_id: string;
  student_id: string;
  school_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card' | 'check';
  payment_gateway?: 'paystack' | 'flutterwave' | 'mtn_momo' | 'vodafone_cash' | 'airtel_money';
  transaction_reference: string;
  payment_date: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  received_by: string; // user_id
  receipt_number: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  school_id: string;
  expense_type: 'salaries' | 'utilities' | 'maintenance' | 'supplies' | 'equipment' | 'transport' | 'other';
  description: string;
  amount: number;
  date: string;
  approved_by: string; // user_id
  status: 'pending' | 'approved' | 'paid';
  receipt_url?: string;
  created_at: string;
}

export interface FinancialReport {
  id: string;
  school_id: string;
  report_type: 'income' | 'expense' | 'balance_sheet' | 'fee_collection';
  period_start: string;
  period_end: string;
  total_income?: number;
  total_expenses?: number;
  net_balance?: number;
  generated_by: string; // user_id
  generated_date: string;
}

// ============ LIBRARY MANAGEMENT ============

export interface Book {
  id: string;
  school_id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category: string;
  sub_category?: string;
  total_copies: number;
  available_copies: number;
  location?: string;
  shelf_number?: string;
  price: number;
  acquisition_date: string;
  book_condition: 'excellent' | 'good' | 'fair' | 'poor';
  created_at: string;
}

export interface BookCopy {
  id: string;
  book_id: string;
  copy_number: number;
  barcode?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'available' | 'borrowed' | 'reserved' | 'missing' | 'damaged';
  created_at: string;
}

export interface Borrowing {
  id: string;
  book_copy_id: string;
  student_id: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  renewal_count: number;
  fine_amount: number;
  fine_paid: boolean;
  librarian_id: string;
  created_at: string;
}

export interface LibraryFine {
  id: string;
  student_id: string;
  borrowing_id?: string;
  fine_reason: 'overdue' | 'damaged' | 'lost' | 'other';
  fine_amount: number;
  payment_status: 'pending' | 'paid';
  payment_date?: string;
  created_at: string;
}

// ============ TRANSPORT MANAGEMENT ============

export interface TransportRoute {
  id: string;
  school_id: string;
  route_code: string;
  route_name: string;
  description?: string;
  start_point: string;
  end_point: string;
  total_stops: number;
  distance_km?: number;
  estimated_time_minutes?: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
}

export interface TransportStop {
  id: string;
  route_id: string;
  stop_sequence: number;
  stop_name: string;
  location_latitude?: number;
  location_longitude?: number;
  arrival_time?: string; // HH:MM
  departure_time?: string; // HH:MM
}

export interface Vehicle {
  id: string;
  school_id: string;
  registration_number: string;
  vehicle_type: 'bus' | 'minibus' | 'van';
  make: string;
  model: string;
  year: number;
  color?: string;
  capacity: number;
  current_passengers: number;
  engine_number?: string;
  chassis_number?: string;
  road_worthiness_expiry?: string;
  insurance_expiry?: string;
  maintenance_status: 'good' | 'needs_maintenance' | 'in_maintenance';
  driver_id: string;
  assistant_id?: string;
  route_id: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface TransportAssignment {
  id: string;
  student_id: string;
  vehicle_id: string;
  route_id: string;
  academic_year: number;
  start_date: string;
  end_date?: string;
  monthly_fee: number;
  payment_status: 'paid' | 'pending' | 'overdue';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface GPSTracking {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  direction?: string;
  timestamp: string;
}

// ============ COMMUNICATION ============

export interface Notification {
  id: string;
  school_id: string;
  recipient_user_id: string;
  notification_type: 'system' | 'announcement' | 'alert' | 'reminder' | 'message';
  title: string;
  content: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface AnnouncementMessage {
  id: string;
  school_id: string;
  sender_id: string; // user_id
  recipient_type: 'all' | 'students' | 'teachers' | 'parents' | 'class' | 'group';
  recipient_class_id?: string;
  recipient_group_id?: string;
  title: string;
  content: string;
  attachment_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_date?: string;
  status: 'draft' | 'published' | 'scheduled';
  created_at: string;
  published_at?: string;
}

export interface SMSLog {
  id: string;
  school_id: string;
  recipient_phone: string;
  recipient_user_id?: string;
  message_type: 'fee_reminder' | 'attendance' | 'announcement' | 'alert' | 'other';
  message_content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sms_provider: 'twillio' | 'vonage' | 'africas_talking' | 'custom';
  external_message_id?: string;
  sent_date: string;
  delivered_date?: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  school_id: string;
  recipient_email: string;
  recipient_user_id?: string;
  subject: string;
  body: string;
  email_type: 'fee_notice' | 'announcement' | 'report' | 'notification' | 'other';
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_date?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_content: string;
  attachment_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ============ VIRTUAL CLASSES & ONLINE LEARNING ============

export interface VirtualClass {
  id: string;
  class_id: string;
  teacher_id: string;
  class_title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  meeting_url: string;
  platform: 'zoom' | 'google_meet' | 'jitsi' | 'custom';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  recording_url?: string;
  max_participants: number;
  created_at: string;
}

export interface VirtualClassAttendance {
  id: string;
  virtual_class_id: string;
  student_id: string;
  join_time: string;
  leave_time?: string;
  duration_minutes: number;
  attended: boolean;
}

export interface LearningMaterial {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  material_title: string;
  material_type: 'pdf' | 'video' | 'document' | 'link' | 'image' | 'presentation';
  file_url: string;
  description?: string;
  upload_date: string;
  access_level: 'public' | 'private' | 'class_only';
  created_at: string;
}

// ============ QR CODE & BIOMETRIC ============

export interface QRCode {
  id: string;
  entity_type: 'student' | 'book' | 'vehicle' | 'event' | 'certificate';
  entity_id: string;
  qr_code_data: string;
  qr_code_image_url: string;
  created_at: string;
}

export interface BiometricRecord {
  id: string;
  student_id: string;
  fingerprint_data?: string;
  iris_data?: string;
  face_data?: string;
  biometric_type: 'fingerprint' | 'iris' | 'face' | 'other';
  enrollment_date: string;
  created_at: string;
}

// ============ INVENTORY & ASSETS ============

export interface Asset {
  id: string;
  school_id: string;
  asset_code: string;
  asset_name: string;
  asset_type: 'equipment' | 'furniture' | 'technology' | 'vehicle' | 'building' | 'other';
  description?: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  location: string;
  assigned_to?: string; // user_id or class_id
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_replacement';
  warranty_expiry?: string;
  maintenance_schedule?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetMaintenance {
  id: string;
  asset_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection';
  maintenance_date: string;
  description: string;
  cost: number;
  performed_by: string; // technician name
  status: 'pending' | 'completed';
  next_maintenance_date?: string;
  created_at: string;
}

// ============ REPORTS & ANALYTICS ============

export interface ReportTemplate {
  id: string;
  school_id: string;
  report_name: string;
  report_type: 'academic' | 'financial' | 'attendance' | 'operational' | 'custom';
  description?: string;
  fields: string[]; // array of field names to include
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on_demand';
  created_by: string; // user_id
  created_at: string;
}

export interface GeneratedReport {
  id: string;
  template_id: string;
  school_id: string;
  report_title: string;
  report_data: Record<string, any>;
  period_start: string;
  period_end: string;
  generated_by: string; // user_id
  file_url?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  generated_at: string;
}

// ============ SETTINGS & CONFIGURATION ============

export interface SchoolSettings {
  id: string;
  school_id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  updated_at: string;
}

export interface SystemSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  updated_at: string;
}

// ============ MISCELLANEOUS ============

export interface AppVersion {
  id: string;
  version_number: string;
  release_date: string;
  features: string[];
  bug_fixes: string[];
  known_issues: string[];
}

export interface Feedback {
  id: string;
  school_id: string;
  user_id: string;
  feedback_type: 'bug' | 'feature_request' | 'improvement' | 'other';
  title: string;
  description: string;
  attachment_url?: string;
  status: 'new' | 'under_review' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  school_id: string;
  integration_name: string;
  integration_type: 'payment' | 'sms' | 'email' | 'video' | 'calendar' | 'other';
  api_key: string; // encrypted
  api_secret?: string; // encrypted
  webhook_url?: string;
  is_active: boolean;
  last_synced?: string;
  created_at: string;
  updated_at: string;
}
