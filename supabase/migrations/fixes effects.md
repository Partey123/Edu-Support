# Complete API Endpoints & Frontend Requirements Guide

## 🏗️ Architecture Overview

```
Frontend (React/Next.js)
    ↓
Supabase Client SDK
    ↓
Supabase Backend (Auto-generated REST API)
    ↓
PostgreSQL + RLS Policies
```

---

## 📡 API ENDPOINTS (Supabase Auto-Generated)

All endpoints follow this pattern: `/rest/v1/{table_name}`

### **Base URL:** `https://your-project.supabase.co/rest/v1/`

---

## 1️⃣ AUTHENTICATION ENDPOINTS

### Auth Operations
```javascript
// Sign Up
POST /auth/v1/signup
Body: { email, password, data: { first_name, last_name } }

// Sign In
POST /auth/v1/token?grant_type=password
Body: { email, password }

// Sign Out
POST /auth/v1/logout

// Get Current User
GET /auth/v1/user

// Update User Profile
PATCH /auth/v1/user
Body: { data: { first_name, last_name, phone } }

// Password Reset Request
POST /auth/v1/recover
Body: { email }

// Password Reset
PUT /auth/v1/user
Body: { password }
```

---

## 2️⃣ CORE ENTITY ENDPOINTS

### Schools
```javascript
// List all schools (super admin only)
GET /schools

// Get specific school
GET /schools?id=eq.{school_id}

// Create school (during signup)
POST /schools
Body: {
  name: string,
  address?: string,
  phone?: string,
  email?: string,
  logo_url?: string
}

// Update school
PATCH /schools?id=eq.{school_id}
Body: { name, address, phone, email, logo_url }

// Soft delete school (super admin only)
PATCH /schools?id=eq.{school_id}
Body: { deleted_at: new Date().toISOString(), deleted_by: user_id }
```

### Profiles
```javascript
// Get current user profile
GET /profiles?id=eq.{auth.uid()}

// Update own profile
PATCH /profiles?id=eq.{auth.uid()}
Body: {
  first_name: string,
  last_name: string,
  phone?: string,
  avatar_url?: string
}

// Get all profiles in school (school admin only)
GET /profiles?school_id=eq.{school_id}
```

### School Memberships
```javascript
// Get user's memberships
GET /school_memberships?user_id=eq.{user_id}

// Get all members of a school
GET /school_memberships?school_id=eq.{school_id}&deleted_at=is.null

// Create membership (school admin only)
POST /school_memberships
Body: {
  user_id: uuid,
  school_id: uuid,
  role: 'school_admin' | 'teacher' | 'parent',
  created_by: uuid
}

// Update membership
PATCH /school_memberships?id=eq.{membership_id}
Body: { role, is_active }

// Soft delete membership
PATCH /school_memberships?id=eq.{membership_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

---

## 3️⃣ ACADEMIC STRUCTURE ENDPOINTS

### Academic Terms
```javascript
// Get all terms for a school
GET /academic_terms?school_id=eq.{school_id}&deleted_at=is.null
  &order=start_date.desc

// Get current term
GET /academic_terms?school_id=eq.{school_id}&is_current=eq.true&deleted_at=is.null

// Create term
POST /academic_terms
Body: {
  school_id: uuid,
  name: string,
  academic_year: string,
  start_date: date,
  end_date: date,
  is_current: boolean,
  created_by: uuid
}

// Update term
PATCH /academic_terms?id=eq.{term_id}
Body: { name, start_date, end_date, is_current, updated_by }

// Set as current term (triggers automatic update of others)
PATCH /academic_terms?id=eq.{term_id}
Body: { is_current: true, updated_by: uuid }
```

### Subjects
```javascript
// Get all subjects for a school
GET /subjects?school_id=eq.{school_id}&deleted_at=is.null&order=name.asc

// Create subject
POST /subjects
Body: {
  school_id: uuid,
  name: string,
  code?: string,
  description?: string,
  created_by: uuid
}

// Update subject
PATCH /subjects?id=eq.{subject_id}
Body: { name, code, description, updated_by }

// Soft delete subject
PATCH /subjects?id=eq.{subject_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

### Classes
```javascript
// Get all classes for a school (filtered by term)
GET /classes?school_id=eq.{school_id}&academic_term_id=eq.{term_id}
  &deleted_at=is.null&order=level.asc,name.asc

// Get class with teacher details
GET /classes?id=eq.{class_id}
  &select=*,class_teacher:teachers(id,first_name,last_name)

// Create class
POST /classes
Body: {
  school_id: uuid,
  academic_term_id: uuid,
  name: string,
  level: string,
  section?: string,
  room?: string,
  class_teacher_id?: uuid,
  created_by: uuid
}

// Update class
PATCH /classes?id=eq.{class_id}
Body: { name, level, section, room, class_teacher_id, updated_by }

// Soft delete class
PATCH /classes?id=eq.{class_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

### Grading Scales
```javascript
// Get grading scale for a school
GET /grading_scales?school_id=eq.{school_id}&deleted_at=is.null
  &order=min_score.asc

// Create grading scale entry
POST /grading_scales
Body: {
  school_id: uuid,
  name: string,
  min_score: number,
  max_score: number,
  grade: string,
  grade_point?: number,
  description?: string,
  created_by: uuid
}

// Update grading scale
PATCH /grading_scales?id=eq.{scale_id}
Body: { name, min_score, max_score, grade, grade_point, updated_by }
```

---

## 4️⃣ PEOPLE ENDPOINTS

### Teachers
```javascript
// Get all teachers for a school
GET /teachers?school_id=eq.{school_id}&deleted_at=is.null
  &order=last_name.asc

// Get teacher with user profile
GET /teachers?id=eq.{teacher_id}
  &select=*,user:profiles(email,phone,avatar_url)

// Create teacher (IMPORTANT: See workflow below)
POST /teachers
Body: {
  school_id: uuid,
  user_id?: uuid,  // Optional: if teacher has user account
  first_name: string,
  last_name: string,
  phone?: string,
  status: 'active',
  hire_date: date,
  created_by: uuid
}

// Update teacher
PATCH /teachers?id=eq.{teacher_id}
Body: { first_name, last_name, phone, status, updated_by }

// Soft delete teacher
PATCH /teachers?id=eq.{teacher_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

### Teacher Subjects (Qualifications)
```javascript
// Get subjects a teacher can teach
GET /teacher_subjects?teacher_id=eq.{teacher_id}&deleted_at=is.null
  &select=*,subject:subjects(*)

// Assign subject to teacher
POST /teacher_subjects
Body: {
  school_id: uuid,
  teacher_id: uuid,
  subject_id: uuid,
  created_by: uuid
}

// Remove subject qualification
PATCH /teacher_subjects?id=eq.{ts_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

### Students
```javascript
// Get all students for a school
GET /students?school_id=eq.{school_id}&deleted_at=is.null
  &order=last_name.asc

// Get student with current enrollment
GET /students?id=eq.{student_id}
  &select=*,enrollments!inner(status,class:classes(*))
  &enrollments.status=eq.active

// Create student (IMPORTANT: See workflow below)
POST /students
Body: {
  school_id: uuid,
  first_name: string,
  last_name: string,
  date_of_birth?: date,
  gender?: 'Male' | 'Female' | 'Other',
  admission_number?: string,
  admission_date: date,
  address?: string,
  status: 'active',
  created_by: uuid
}

// Update student
PATCH /students?id=eq.{student_id}
Body: { first_name, last_name, date_of_birth, gender, address, status, updated_by }

// Soft delete student
PATCH /students?id=eq.{student_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

### Student Guardians
```javascript
// Get guardians for a student
GET /student_guardians?student_id=eq.{student_id}&deleted_at=is.null
  &select=*,guardian:profiles(*)

// Get students for a guardian (parent view)
GET /student_guardians?guardian_user_id=eq.{user_id}&deleted_at=is.null
  &select=*,student:students(*)

// Add guardian to student
POST /student_guardians
Body: {
  school_id: uuid,
  student_id: uuid,
  guardian_user_id: uuid,
  relationship: 'mother' | 'father' | 'guardian' | 'grandparent' | 'other',
  is_primary: boolean,
  is_emergency_contact: boolean,
  can_pickup: boolean,
  receives_reports: boolean,
  phone?: string,
  email?: string,
  created_by: uuid
}

// Update guardian relationship
PATCH /student_guardians?id=eq.{sg_id}
Body: { 
  is_primary, 
  is_emergency_contact, 
  can_pickup, 
  receives_reports,
  phone,
  email,
  updated_by 
}

// Remove guardian
PATCH /student_guardians?id=eq.{sg_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

---

## 5️⃣ OPERATIONAL ENDPOINTS

### Enrollments
```javascript
// Get enrollments for a class
GET /enrollments?class_id=eq.{class_id}&deleted_at=is.null
  &select=*,student:students(*)

// Get student's enrollments
GET /enrollments?student_id=eq.{student_id}&deleted_at=is.null
  &order=enrollment_date.desc

// Get active enrollment for student in current term
GET /enrollments?student_id=eq.{student_id}
  &academic_term_id=eq.{term_id}&status=eq.active&deleted_at=is.null

// Enroll student in class
POST /enrollments
Body: {
  school_id: uuid,
  student_id: uuid,
  class_id: uuid,
  academic_term_id: uuid,
  enrollment_date: date,
  status: 'active',
  notes?: string,
  created_by: uuid
}

// Update enrollment (e.g., transfer student)
PATCH /enrollments?id=eq.{enrollment_id}
Body: { class_id, status, notes, updated_by }

// Withdraw student
PATCH /enrollments?id=eq.{enrollment_id}
Body: { 
  status: 'withdrawn',
  withdrawal_date: date,
  notes: string,
  updated_by: uuid
}
```

### Class Subjects
```javascript
// Get subjects taught in a class
GET /class_subjects?class_id=eq.{class_id}&deleted_at=is.null
  &select=*,subject:subjects(*),teacher:teachers(*)

// Get classes where a teacher teaches
GET /class_subjects?teacher_id=eq.{teacher_id}&deleted_at=is.null
  &select=*,class:classes(*),subject:subjects(*)

// Assign subject to class
POST /class_subjects
Body: {
  school_id: uuid,
  class_id: uuid,
  subject_id: uuid,
  teacher_id?: uuid,
  created_by: uuid
}

// Update teacher assignment
PATCH /class_subjects?id=eq.{cs_id}
Body: { teacher_id, updated_by }

// Remove subject from class
PATCH /class_subjects?id=eq.{cs_id}
Body: { deleted_at: timestamp, deleted_by: uuid }
```

### Attendance
```javascript
// Get attendance for a date
GET /attendance?school_id=eq.{school_id}&date=eq.{date}&deleted_at=is.null
  &select=*,enrollment:enrollments(student:students(*))

// Get attendance for a specific enrollment
GET /attendance?enrollment_id=eq.{enrollment_id}&deleted_at=is.null
  &order=date.desc

// Mark attendance
POST /attendance
Body: {
  school_id: uuid,
  enrollment_id: uuid,
  date: date,
  status: 'present' | 'absent' | 'late' | 'excused',
  notes?: string,
  marked_by: uuid
}

// Update attendance
PATCH /attendance?id=eq.{attendance_id}
Body: { status, notes, updated_by }

// Bulk mark attendance (use transaction)
POST /rpc/bulk_mark_attendance
Body: {
  attendance_records: [
    { enrollment_id, date, status, marked_by },
    ...
  ]
}
```

---

## 6️⃣ ASSESSMENT ENDPOINTS

### Assessment Types
```javascript
// Get assessment types for school
GET /assessment_types?school_id=eq.{school_id}&deleted_at=is.null
  &order=weight.desc

// Create assessment type
POST /assessment_types
Body: {
  school_id: uuid,
  name: string,
  code?: string,
  weight: number,  // 0-100
  description?: string,
  created_by: uuid
}

// Update assessment type
PATCH /assessment_types?id=eq.{type_id}
Body: { name, code, weight, description, updated_by }
```

### Assessments
```javascript
// Get assessments for a class-subject
GET /assessments?class_subject_id=eq.{cs_id}&deleted_at=is.null
  &select=*,assessment_type:assessment_types(*),class_subject:class_subjects(class:classes(*),subject:subjects(*))

// Create assessment
POST /assessments
Body: {
  school_id: uuid,
  class_subject_id: uuid,
  assessment_type_id: uuid,
  name: string,
  description?: string,
  max_score: number,
  date?: date,
  created_by: uuid
}

// Update assessment
PATCH /assessments?id=eq.{assessment_id}
Body: { name, description, max_score, date, updated_by }
```

### Grades
```javascript
// Get grades for an assessment
GET /grades?assessment_id=eq.{assessment_id}&deleted_at=is.null
  &select=*,enrollment:enrollments(student:students(*))

// Get grades for a student
GET /grades?enrollment_id=eq.{enrollment_id}&deleted_at=is.null
  &select=*,assessment:assessments(*)

// Record grade
POST /grades
Body: {
  school_id: uuid,
  enrollment_id: uuid,
  assessment_id: uuid,
  score?: number,
  grade?: string,  // At least one required
  remarks?: string,
  recorded_by: uuid
}

// Update grade
PATCH /grades?id=eq.{grade_id}
Body: { score, grade, remarks, updated_by }

// Bulk record grades
POST /rpc/bulk_record_grades
Body: {
  grades: [
    { enrollment_id, assessment_id, score, recorded_by },
    ...
  ]
}
```

---

## 7️⃣ FINANCIAL ENDPOINTS

### Fee Types
```javascript
// Get fee types for school
GET /fee_types?school_id=eq.{school_id}&deleted_at=is.null

// Create fee type
POST /fee_types
Body: {
  school_id: uuid,
  name: string,
  code?: string,
  description?: string,
  default_amount?: number,
  is_mandatory: boolean,
  created_by: uuid
}

// Update fee type
PATCH /fee_types?id=eq.{fee_type_id}
Body: { name, code, description, default_amount, is_mandatory, updated_by }
```

### Fee Assignments
```javascript
// Get fees for a student in a term
GET /fee_assignments?student_id=eq.{student_id}
  &academic_term_id=eq.{term_id}&deleted_at=is.null
  &select=*,fee_type:fee_types(*),payments(*)

// Get all fee assignments for a term
GET /fee_assignments?academic_term_id=eq.{term_id}&deleted_at=is.null
  &select=*,student:students(*),fee_type:fee_types(*)

// Assign fee to student
POST /fee_assignments
Body: {
  school_id: uuid,
  student_id: uuid,
  academic_term_id: uuid,
  fee_type_id: uuid,
  amount: number,
  due_date?: date,
  discount: number,
  notes?: string,
  created_by: uuid
}

// Update fee assignment
PATCH /fee_assignments?id=eq.{fa_id}
Body: { amount, due_date, discount, notes, updated_by }
```

### Payments
```javascript
// Get payments for a fee assignment
GET /payments?fee_assignment_id=eq.{fa_id}&deleted_at=is.null
  &order=payment_date.desc

// Get all payments for a student
GET /payments?fee_assignment_id=in.(select id from fee_assignments where student_id=eq.{student_id})
  &deleted_at=is.null

// Record payment
POST /payments
Body: {
  school_id: uuid,
  fee_assignment_id: uuid,
  amount: number,
  payment_date: date,
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'check' | 'other',
  reference_number?: string,
  status: 'pending' | 'paid',
  notes?: string,
  recorded_by: uuid
}

// Update payment
PATCH /payments?id=eq.{payment_id}
Body: { amount, payment_date, status, notes, updated_by }
```

---

## 8️⃣ UTILITY VIEWS (Read-Only)

```javascript
// Get active enrollments with full details
GET /v_active_enrollments?school_id=eq.{school_id}

// Get student guardians with profiles
GET /v_student_guardians?school_id=eq.{school_id}

// Get teacher class assignments
GET /v_teacher_class_assignments?school_id=eq.{school_id}
  &academic_term_id=eq.{term_id}
```

---

## 9️⃣ CUSTOM RPC FUNCTIONS (Create these as needed)

```javascript
// Get dashboard statistics
POST /rpc/get_dashboard_stats
Body: { school_id: uuid, term_id: uuid }
Returns: {
  total_students: number,
  total_teachers: number,
  total_classes: number,
  attendance_rate: number,
  fee_collection_rate: number
}

// Get student report card
POST /rpc/get_student_report_card
Body: { student_id: uuid, term_id: uuid }
Returns: {
  student: {...},
  class: {...},
  subjects: [
    { subject_name, teacher_name, assessments: [...], average: number }
  ],
  attendance: { present: number, total: number },
  fees: { total: number, paid: number }
}

// Bulk enroll students
POST /rpc/bulk_enroll_students
Body: {
  school_id: uuid,
  class_id: uuid,
  term_id: uuid,
  student_ids: uuid[],
  enrollment_date: date,
  created_by: uuid
}

// Transfer student to another class
POST /rpc/transfer_student
Body: {
  student_id: uuid,
  from_class_id: uuid,
  to_class_id: uuid,
  term_id: uuid,
  transfer_date: date,
  notes: string,
  updated_by: uuid
}

// Calculate student GPA
POST /rpc/calculate_student_gpa
Body: { student_id: uuid, term_id: uuid }
Returns: { gpa: number, total_credits: number }
```

---

## 🔐 AUTHENTICATION FLOW

### 1. School Admin Creates Account
```javascript
// Step 1: Sign up with email
const { data, error } = await supabase.auth.signUp({
  email: 'admin@school.com',
  password: 'password',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
});

// Step 2: Profile auto-created (trigger)
// Step 3: Create school
const { data: school } = await supabase
  .from('schools')
  .insert({ name: 'My School', ... })
  .select()
  .single();

// Step 4: Create school membership
await supabase.from('school_memberships').insert({
  user_id: data.user.id,
  school_id: school.id,
  role: 'school_admin',
  created_by: data.user.id
});
```

---

## 👨‍🏫 TEACHER CREATION WORKFLOW

### Option A: Teacher WITHOUT User Account (Basic)
```javascript
// School admin creates teacher record only
const { data: teacher } = await supabase
  .from('teachers')
  .insert({
    school_id: currentSchool.id,
    first_name: 'Jane',
    last_name: 'Smith',
    phone: '+1234567890',
    status: 'active',
    hire_date: new Date().toISOString(),
    created_by: currentUser.id
    // user_id is NULL
  })
  .select()
  .single();

// Teacher can only be viewed in records, cannot login
```

### Option B: Teacher WITH User Account (Full Access)
```javascript
// Step 1: School admin invites teacher via email
const { data: inviteData } = await supabase.auth.admin.inviteUserByEmail(
  'teacher@school.com',
  {
    data: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
);

// Step 2: Profile auto-created (trigger)
// Step 3: Create teacher record
const { data: teacher } = await supabase
  .from('teachers')
  .insert({
    school_id: currentSchool.id,
    user_id: inviteData.user.id,  // Link to user
    first_name: 'Jane',
    last_name: 'Smith',
    phone: '+1234567890',
    status: 'active',
    hire_date: new Date().toISOString(),
    created_by: currentUser.id
  })
  .select()
  .single();

// Step 4: Create school membership
await supabase.from('school_memberships').insert({
  user_id: inviteData.user.id,
  school_id: currentSchool.id,
  role: 'teacher',
  created_by: currentUser.id
});

// Step 5: Assign subjects teacher can teach
await supabase.from('teacher_subjects').insert([
  { teacher_id: teacher.id, subject_id: mathSubjectId, school_id: currentSchool.id },
  { teacher_id: teacher.id, subject_id: physicsSubjectId, school_id: currentSchool.id }
]);

// Teacher receives email, sets password, can now login
```

---

## 👨‍🎓 STUDENT CREATION WORKFLOW

### Complete Student Setup
```javascript
// Step 1: Create student record
const { data: student } = await supabase
  .from('students')
  .insert({
    school_id: currentSchool.id,
    first_name: 'Alice',
    last_name: 'Johnson',
    date_of_birth: '2010-05-15',
    gender: 'Female',
    admission_number: 'STU2024001',
    admission_date: new Date().toISOString(),
    address: '123 Main St',
    status: 'active',
    created_by: currentUser.id
  })
  .select()
  .single();

// Step 2: Invite parent/guardian (if they don't have account)
const { data: guardianUser } = await supabase.auth.admin.inviteUserByEmail(
  'parent@email.com',
  {
    data: {
      first_name: 'Robert',
      last_name: 'Johnson'
    }
  }
);

// Step 3: Create school membership for parent
await supabase.from('school_memberships').insert({
  user_id: guardianUser.user.id,
  school_id: currentSchool.id,
  role: 'parent',
  created_by: currentUser.id
});

// Step 4: Link guardian to student
await supabase.from('student_guardians').insert({
  school_id: currentSchool.id,
  student_id: student.id,
  guardian_user_id: guardianUser.user.id,
  relationship: 'father',
  is_primary: true,
  is_emergency_contact: true,
  can_pickup: true,
  receives_reports: true,
  phone: '+1234567890',
  email: 'parent@email.com',
  created_by: currentUser.id
});

// Step 5: Enroll student in a class
await supabase.from('enrollments').insert({
  school_id: currentSchool.id,
  student_id: student.id,
  class_id: selectedClassId,
  academic_term_id: currentTermId,
  enrollment_date: new Date().toISOString(),
  status: 'active',
  created_by: currentUser.id
});

// Parent receives email, sets password, can now view their child's info
```

---

## 📱 FRONTEND FEATURES REQUIRED

### 1. **Authentication Module**
- [ ] Login page
- [ ] Signup page (with school creation)
- [ ] Password reset
- [ ] Email verification
- [ ] Multi-factor authentication (optional)
- [ ] Role-based redirect after login

### 2. **Dashboard (Role-Based)**

#### Super Admin Dashboard
- [ ] List of all schools
- [ ] School statistics
- [ ] System-wide analytics
- [ ] User management

#### School Admin Dashboard
- [ ] School overview
- [ ] Quick stats (students, teachers, classes)
- [ ] Current term info
- [ ] Recent activities
- [ ] Pending tasks (fee payments, enrollments)

#### Teacher Dashboard
- [ ] My classes
- [ ] Today's schedule
- [ ] Attendance summary
- [ ] Recent assessments
- [ ] Student performance overview

#### Parent Dashboard
- [ ] My children
- [ ] Current classes
- [ ] Recent grades
- [ ] Attendance records
- [ ] Fee status

### 3. **School Management**
- [ ] School profile settings
- [ ] Academic year & term management
- [ ] Grading scale configuration
- [ ] Fee types management
- [ ] Subject management

### 4. **User Management**
- [ ] View all users (filtered by role)
- [ ] Create/invite users
- [ ] Assign roles
- [ ] Manage permissions
- [ ] Deactivate users

### 5. **Teacher Management**
- [ ] Teacher list (with search/filter)
- [ ] Add new teacher (with/without account)
- [ ] Edit teacher details
- [ ] Assign subjects to teacher
- [ ] Assign teachers to classes
- [ ] Teacher profile view
- [ ] Teacher schedule

### 6. **Student Management**
- [ ] Student list (with search/filter)
- [ ] Add new student
- [ ] Edit student details
- [ ] Student profile view
- [ ] Add/manage guardians
- [ ] Enrollment history
- [ ] Transfer student to another class

### 7. **Class Management**
- [ ] Class list (filtered by term)
- [ ] Create new class
- [ ] Edit class details
- [ ] Assign class teacher
- [ ] Assign subjects to class
- [ ] Assign teachers to subjects
- [ ] View class roster (enrolled students)
- [ ] Bulk enroll students

### 8. **Enrollment Management**
- [ ] Enroll student in class
- [ ] View enrollment history
- [ ] Withdraw student
- [ ] Transfer student
- [ ] Bulk enrollment

### 9. **Attendance Module**
- [ ] Daily attendance marking (by class)
- [ ] Bulk attendance entry
- [ ] Edit attendance
- [ ] Attendance reports
  - [ ] By student
  - [ ] By class
  - [ ] By date range
  - [ ] Attendance summary/statistics

### 10. **Assessment Module**
- [ ] Assessment types configuration
- [ ] Create assessment (test/quiz/exam)
- [ ] Assessment list (by class/subject)
- [ ] Grade entry form
  - [ ] Individual entry
  - [ ] Bulk/spreadsheet entry
- [ ] Grade reports
  - [ ] By student
  - [ ] By class
  - [ ] By subject
  - [ ] Class average

### 11. **Grading & Reports**
- [ ] Student report card (by term)
- [ ] Class performance report
- [ ] Subject performance report
- [ ] Teacher performance report
- [ ] Progress tracking
- [ ] GPA calculation
- [ ] Export reports (PDF/Excel)

### 12. **Financial Module**
- [ ] Fee types management
- [ ] Assign fees to students
- [ ] Bulk fee assignment
- [ ] Record payments
- [ ] Payment history
- [ ] Fee balance reports
- [ ] Revenue reports
- [ ] Outstanding fees report
- [ ] Payment receipts (generate PDF)

### 13. **Communication Module** (Future)
- [ ] Send notifications
- [ ] SMS integration
- [ ] Email templates
- [ ] Announcements
- [ ] Parent-teacher messaging

### 14. **Settings**
- [ ] School profile
- [ ] User profile
- [ ] Change password
- [ ] Upload logo/avatar
- [ ] Notification preferences
- [ ] System preferences

---

## 🎨 UI COMPONENT REQUIREMENTS

### Data Tables
- Sortable columns
- Search/filter
- Pagination
- Bulk actions
- Export (CSV/PDF)
- Responsive design

### Forms
- Validation
- Multi-step forms
- File upload
- Date pickers
- Select dropdowns (searchable)
- Auto-complete
- Form state management

### Modals/Dialogs
- Create/Edit forms
- Confirmation dialogs
- Detail views
- Multi-step wizards

### Notifications
- Success messages
- Error messages
- Warning alerts
- Loading