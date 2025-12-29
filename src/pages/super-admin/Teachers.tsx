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
  Users,
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

interface Teacher {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  school_id: string;
  created_at: string;
  school?: {
    name: string;
  };
  class_count?: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  const pageSize = 20;

  useEffect(() => {
    fetchSchools();
    fetchTeachers();
  }, [searchQuery, selectedStatus, selectedSchool, page]);

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

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("teachers")
        .select(
          `*,
          school:schools(name)`,
          { count: "exact" }
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus as any);
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

      // Fetch class count for each teacher
      const teachersWithCounts = await Promise.all(
        (data || []).map(async (teacher) => {
          const { count } = await supabase
            .from("classes")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", teacher.id)
            .is("deleted_at", null);

          return {
            ...teacher,
            class_count: count || 0,
          };
        })
      );

      setTeachers(teachersWithCounts);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const { error } = await supabase
        .from("teachers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setTeachers(teachers.filter((t) => t.id !== id));
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error",
        description: "Failed to delete teacher",
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
            <Users className="h-8 w-8" />
            All Teachers
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all teachers across the platform
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 border rounded-lg px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="border-0 focus-visible:ring-0"
                />
              </div>

              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

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

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                  setSelectedSchool("all");
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers ({teachers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : teachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No teachers found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        School
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Classes
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Joined
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">
                            {teacher.first_name} {teacher.last_name}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {teacher.email || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {teacher.school?.name || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {teacher.class_count || 0} classes
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              teacher.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {teacher.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(teacher.created_at).toLocaleDateString()}
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
                                  navigate(
                                    `/admin/teachers/${teacher.id}/detail`
                                  )
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
                                onClick={() => handleDelete(teacher.id)}
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
            {teachers.length > 0 && (
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
                    disabled={teachers.length < pageSize}
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
