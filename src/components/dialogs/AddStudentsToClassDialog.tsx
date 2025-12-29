import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bulkEnrollStudents, getAvailableStudentsForClass } from "@/services/enrollmentService";
import { useAuth } from "@/hooks/useAuth";
import { useRefreshClasses } from "@/hooks/useSchoolData";

interface AddStudentsToClassDialogProps {
  classId: string;
  className: string;
  onEnrollmentSuccess?: () => void;
}

export function AddStudentsToClassDialog({
  classId,
  className,
  onEnrollmentSuccess,
}: AddStudentsToClassDialogProps) {
  const { schoolId } = useAuth();
  const { toast } = useToast();
  const { refreshClasses } = useRefreshClasses();
  const [open, setOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (open && schoolId) {
      fetchAvailableStudents();
    }
  }, [open, schoolId]);

  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      const students = await getAvailableStudentsForClass(classId, schoolId!);
      setAvailableStudents(students);
      setSelectedStudents(new Set());
    } catch (error) {
      console.error("Error fetching available students:", error);
      toast({
        title: "Error",
        description: "Failed to load available students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === availableStudents.length) {
      setSelectedStudents(new Set());
    } else {
      const allIds = new Set(availableStudents.map(s => s.id));
      setSelectedStudents(allIds);
    }
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      setEnrolling(true);
      const result = await bulkEnrollStudents(
        classId,
        Array.from(selectedStudents)
      );

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setOpen(false);
        refreshClasses();
        onEnrollmentSuccess?.();
      } else {
        toast({
          title: "Partial Success",
          description: result.message,
          variant: result.enrolled === 0 ? "destructive" : "default",
        });
        if (result.enrolled > 0) {
          setOpen(false);
          refreshClasses();
          onEnrollmentSuccess?.();
        }
      }
    } catch (error) {
      console.error("Error enrolling students:", error);
      toast({
        title: "Error",
        description: "Failed to enroll students",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Students to {className}</DialogTitle>
          <DialogDescription>
            Select students to enroll in this class. Selected: {selectedStudents.size}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No available students to add</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b pb-3">
                <Checkbox
                  id="select-all"
                  checked={selectedStudents.size === availableStudents.length}
                  onCheckedChange={toggleAllStudents}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  Select All ({availableStudents.length})
                </label>
              </div>

              <ScrollArea className="h-96 border rounded-md p-4">
                <div className="space-y-2">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
                    >
                      <Checkbox
                        id={student.id}
                        checked={selectedStudents.has(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      <label
                        htmlFor={student.id}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.admission_number}
                        </p>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEnrollStudents}
            disabled={selectedStudents.size === 0 || enrolling}
            className="gap-2"
          >
            {enrolling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Enroll {selectedStudents.size > 0 ? `(${selectedStudents.size})` : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
