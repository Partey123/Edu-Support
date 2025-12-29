import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Class {
  id: string;
  name: string;
  level: string;
  section: string | null;
  school_id: string;
  academic_term_id: string;
  created_at: string;
  school?: {
    name: string;
  };
  student_count?: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  const pageSize = 20;

  useEffect(() => {
    fetchSchools();
    fetchClasses();
  }, [searchQuery, selectedSchool, page]);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("classes")
        .select(
          `*,
          school:schools(name)`,
          { count: "exact" }
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (selectedSchool !== "all") {
        query = query.eq("school_id", selectedSchool);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      // Fetch student count for each class
      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id)
            .eq("status", "active");

          return {
            ...cls,
            student_count: count || 0,
          };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const { error } = await supabase
        .from("classes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setClasses(classes.filter((c) => c.id !== id));
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            All Classes
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all classes across the platform
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 border rounded-lg px-3 md:col-span-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by class name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="border-0 focus-visible:ring-0"
                />
              </div>

              <Select
                value={selectedSchool}
                onValueChange={(value) => {
                  setSelectedSchool(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Classes List */}
        <Card>
          <CardHeader>
            <CardTitle>Classes ({classes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : classes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No classes found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Class Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Form/Level
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        School
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Students
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Created
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">
                            {cls.name}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {cls.form && `Form ${cls.form}`}
                          {cls.form && cls.level && " • "}
                          {cls.level && `Level ${cls.level}`}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {cls.school?.name || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {cls.student_count || 0} students
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(cls.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/admin/classes/${cls.id}/detail`)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(cls.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {classes.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing page {page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={classes.length < pageSize}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
