-- Create teacher_invitations table
CREATE TABLE IF NOT EXISTS teacher_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) + INTERVAL '7 days' NOT NULL,
  UNIQUE(teacher_id)
);

-- Create index for faster lookups
CREATE INDEX idx_teacher_invitations_teacher_id ON teacher_invitations(teacher_id);
CREATE INDEX idx_teacher_invitations_status ON teacher_invitations(status);
