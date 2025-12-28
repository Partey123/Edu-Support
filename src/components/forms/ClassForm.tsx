import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CLASS_LEVELS = [
  { value: "KG1", label: "Kindergarten 1" },
  { value: "KG2", label: "Kindergarten 2" },
  { value: "P1", label: "Primary 1" },
  { value: "P2", label: "Primary 2" },
  { value: "P3", label: "Primary 3" },
  { value: "P4", label: "Primary 4" },
  { value: "P5", label: "Primary 5" },
  { value: "P6", label: "Primary 6" },
  { value: "JHS1", label: "JHS 1" },
  { value: "JHS2", label: "JHS 2" },
  { value: "JHS3", label: "JHS 3" },
];

interface ClassFormProps {
  formData: {
    name: string;
    level: string;
    section: string;
    room: string;
    class_teacher_id: string;
    academic_term_id: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit: boolean;
  teachers: any[];
  isLoading: boolean;
  academicTerms?: any[];
}

export function ClassForm({
  formData,
  onFormDataChange,
  onSubmit,
  isEdit,
  teachers,
  isLoading,
  academicTerms = [],
}: ClassFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Class Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder="e.g., Basic 6A"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value) =>
              onFormDataChange({ ...formData, level: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            value={formData.section}
            onChange={(e) =>
              onFormDataChange({ ...formData, section: e.target.value })
            }
            placeholder="e.g., A, B, C"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="room">Room</Label>
        <Input
          id="room"
          value={formData.room}
          onChange={(e) => onFormDataChange({ ...formData, room: e.target.value })}
          placeholder="e.g., Room 12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="class_teacher_id">Class Teacher</Label>
        <Select
          value={formData.class_teacher_id || "none"}
          onValueChange={(value) =>
            onFormDataChange({ ...formData, class_teacher_id: value === "none" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select teacher (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Teacher Assigned</SelectItem>
            {teachers
              .filter((t) => t.status === "active")
              .map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="academic_term_id">Academic Term</Label>
        <Select
          value={formData.academic_term_id}
          onValueChange={(value) =>
            onFormDataChange({ ...formData, academic_term_id: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select academic term" />
          </SelectTrigger>
          <SelectContent>
            {academicTerms.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name} ({term.academic_year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isEdit ? "Update Class" : "Add Class"}
      </Button>
    </form>
  );
}
