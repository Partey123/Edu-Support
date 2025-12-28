import { useState, useEffect } from 'react';
import { Building, Users, TrendingUp, GraduationCap, Plus, Search, MoreVertical, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  useSuperAdminOverview, 
  useSuperAdminSchools 
} from '@/hooks/useSuperAdminData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SuperAdminDashboard() {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data using custom hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useSuperAdminOverview();
  const { data: schools, isLoading: schoolsLoading, error: schoolsError } = useSuperAdminSchools(searchTerm);

  // Redirect if not super admin
  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      navigate('/login');
    }
  }, [isSuperAdmin, authLoading, navigate]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <DashboardLayout role="super-admin">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage all schools and monitor platform performance.
        </p>
      </div>

      {/* Error Alerts */}
      {statsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Failed to load statistics: {statsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Schools"
              value={stats?.totalSchools.toLocaleString() || '0'}
              change={`${stats?.activeSchools || 0} active`}
              changeType="positive"
              icon={Building}
            />
            <StatCard
              title="Total Students"
              value={stats?.totalStudents.toLocaleString() || '0'}
              change="Across all schools"
              changeType="neutral"
              icon={Users}
            />
            <StatCard
              title="Total Teachers"
              value={stats?.totalTeachers.toLocaleString() || '0'}
              change="Active educators"
              changeType="positive"
              icon={GraduationCap}
            />
            <StatCard
              title="Total Classes"
              value={stats?.totalClasses.toLocaleString() || '0'}
              change="All schools"
              changeType="neutral"
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Schools Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">Schools Overview</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search schools..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="default" onClick={() => navigate('/super-admin/schools')}>
                <Plus className="h-4 w-4" />
                Add School
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {schoolsError && (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load schools: {schoolsError.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Table Content */}
        {schoolsLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24 ml-auto" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : schools && schools.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schools found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'Try adjusting your search term' 
                : 'Get started by adding your first school'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/super-admin/schools')}>
                <Plus className="h-4 w-4 mr-2" />
                Add First School
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">School</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Location</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Students</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Teachers</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Classes</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools?.map((school) => (
                    <tr key={school.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                            {school.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{school.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {school.address ? (
                          <span className="line-clamp-1">{school.address}</span>
                        ) : (
                          <span className="text-muted-foreground/50">No address</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-medium">
                          {school.studentCount.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-medium">
                          {school.teacherCount}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-medium">
                          {school.classCount}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {school.is_active ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="text-success text-sm font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/super-admin/schools/${school.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/super-admin/schools/${school.id}/edit`)}>
                              Edit School
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                // TODO: Implement delete/deactivate
                                console.log('Deactivate school:', school.id);
                              }}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {schools?.length || 0} school{schools?.length !== 1 ? 's' : ''}
                {stats?.totalSchools ? ` of ${stats.totalSchools.toLocaleString()}` : ''}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}