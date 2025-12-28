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

interface StudentFormProps {
  formData: {
    first_name: string;
    last_name: string;
    gender: "Male" | "Female" | "Other" | "";
    date_of_birth: string;
    admission_number: string;
    admission_date: string;
    address: string;
    status: "active" | "inactive" | "graduated" | "transferred";
    guardian_first_name: string;
    guardian_last_name: string;
    guardian_email: string;
    guardian_phone: string;
    relationship: "mother" | "father" | "guardian" | "grandparent" | "other";
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit: boolean;
  isLoading: boolean;
}

export function StudentForm({
  formData,
  onFormDataChange,
  onSubmit,
  isEdit,
  isLoading,
}: StudentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Student Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Student Information</h3>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onFormDataChange({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onFormDataChange({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                onFormDataChange({ ...formData, gender: value as "Male" | "Female" | "Other" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                onFormDataChange({ ...formData, date_of_birth: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="admission_number">Admission Number</Label>
            <Input
              id="admission_number"
              value={formData.admission_number}
              onChange={(e) => onFormDataChange({ ...formData, admission_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admission_date">Admission Date</Label>
            <Input
              id="admission_date"
              type="date"
              value={formData.admission_date}
              onChange={(e) => onFormDataChange({ ...formData, admission_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  status: value as "active" | "inactive" | "graduated" | "transferred",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      {/* Guardian Information */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-semibold text-foreground">Guardian Information</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardian_first_name">Guardian First Name</Label>
            <Input
              id="guardian_first_name"
              value={formData.guardian_first_name}
              onChange={(e) => onFormDataChange({ ...formData, guardian_first_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardian_last_name">Guardian Last Name</Label>
            <Input
              id="guardian_last_name"
              value={formData.guardian_last_name}
              onChange={(e) => onFormDataChange({ ...formData, guardian_last_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  relationship: value as "mother" | "father" | "guardian" | "grandparent" | "other",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="grandparent">Grandparent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardian_phone">Guardian Phone</Label>
            <Input
              id="guardian_phone"
              value={formData.guardian_phone}
              onChange={(e) => onFormDataChange({ ...formData, guardian_phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardian_email">Guardian Email</Label>
            <Input
              id="guardian_email"
              type="email"
              value={formData.guardian_email}
              onChange={(e) => onFormDataChange({ ...formData, guardian_email: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isEdit ? "Update Student" : "Add Student"}
      </Button>
    </form>
  );
}
