import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "Physical Education",
  "Art",
  "Music",
  "Information Technology",
  "French",
  "Akan",
];

interface TeacherFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password?: string;
    subjects: string[];
    status: "active" | "on-leave" | "inactive";
    hire_date: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleSubject: (subject: string) => void;
  isEdit: boolean;
  isLoading: boolean;
}

export function TeacherForm({
  formData,
  onFormDataChange,
  onSubmit,
  onToggleSubject,
  isEdit,
  isLoading,
}: TeacherFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) =>
              onFormDataChange({ ...formData, first_name: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) =>
              onFormDataChange({ ...formData, last_name: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
            required
          />
        </div>
        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              required={!isEdit}
            />
          </div>
        )}
        {isEdit && (
          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => onFormDataChange({ ...formData, hire_date: e.target.value })}
              required
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                status: value as typeof formData.status,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Subjects</Label>
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
          {SUBJECTS.map((subject) => (
            <Badge
              key={subject}
              variant={formData.subjects.includes(subject) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSubject(subject);
              }}
            >
              {subject}
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isEdit ? "Update Teacher" : "Add Teacher"}
      </Button>
    </form>
  );
}
