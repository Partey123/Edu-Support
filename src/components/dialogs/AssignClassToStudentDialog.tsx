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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enrollStudentInClass, getAvailableClassesForStudent } from "@/services/enrollmentService";
import { useAuth } from "@/hooks/useAuth";
import { useRefreshClasses } from "@/hooks/useSchoolData";

interface AssignClassToStudentDialogProps {
  studentId: string;
  studentName: string;
  onEnrollmentSuccess?: () => void;
}

export function AssignClassToStudentDialog({
  studentId,
  studentName,
  onEnrollmentSuccess,
}: AssignClassToStudentDialogProps) {
  const { schoolId } = useAuth();
  const { toast } = useToast();
  const { refreshClasses } = useRefreshClasses();
  const [open, setOpen] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    if (open && schoolId) {
      fetchAvailableClasses();
    }
  }, [open, schoolId]);

  const fetchAvailableClasses = async () => {
    try {
      setLoading(true);
      const classes = await getAvailableClassesForStudent(studentId, schoolId!);
      setAvailableClasses(classes);
    } catch (error) {
      console.error("Error fetching available classes:", error);
      toast({
        title: "Error",
        description: "Failed to load available classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClass = async (classId: string) => {
    try {
      setEnrolling(classId);
      const result = await enrollStudentInClass(studentId, classId);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        await refreshClasses();
        fetchAvailableClasses();
        onEnrollmentSuccess?.();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error enrolling student:", error);
      toast({
        title: "Error",
        description: "Failed to enroll student in class",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Class
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Class to {studentName}</DialogTitle>
          <DialogDescription>
            Select a class to assign this student to.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96 border rounded-md p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No available classes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                >
                  <div className="flex-1">
                    <p className="font-medium">{cls.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {cls.level}
                      </Badge>
                      {cls.section && (
                        <Badge variant="outline" className="text-xs">
                          {cls.section}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleEnrollClass(cls.id)}
                    disabled={enrolling === cls.id}
                  >
                    {enrolling === cls.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
