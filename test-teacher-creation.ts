// Test script to verify teacher creation edge function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://ygsgyamxglwtnyaonyhn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc2d5YW14Z2x3dG55YW9ueWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDcxODEyMCwiZXhwIjoxODkyMzg0MTIwfQ.8-Rx9GptVGrXt-a2L6CaJcnM9F0FP-wKz1bB9e3f7Rs'

// Test teacher data
const testTeacher = {
  first_name: 'Test',
  last_name: 'Teacher',
  email: 'test-teacher-' + Date.now() + '@test.com',
  password: 'TestPassword123!',
  phone: '1234567890',
  subjects: ['Math', 'Science'],
}

console.log('Testing teacher creation...')
console.log('Teacher email:', testTeacher.email)

// This would need a valid JWT token from the frontend
// For now, just log the test data
console.log('Test payload:', JSON.stringify(testTeacher, null, 2))
