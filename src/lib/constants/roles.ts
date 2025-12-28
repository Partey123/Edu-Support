export const USER_ROLES = {
  SUPER_ADMIN: "super-admin",
  SCHOOL_ADMIN: "school-admin",
  TEACHER: "teacher",
  PARENT: "parent",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  "super-admin": "Super Administrator",
  "school-admin": "School Administrator",
  "teacher": "Teacher",
  "parent": "Parent/Guardian",
};

export const ROLE_COLORS: Record<string, string> = {
  "super-admin": "bg-destructive text-destructive-foreground",
  "school-admin": "bg-primary text-primary-foreground",
  "teacher": "bg-info text-info-foreground",
  "parent": "bg-success text-success-foreground",
};
