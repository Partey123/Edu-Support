import { useEffect, useState } from "react";
import { ArrowLeft, Building, Users, GraduationCap, Mail, Phone, MapPin, Calendar, Edit, Trash2, Clock, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useParams, useNavigate } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionTimerDisplay } from "@/components/subscription/SubscriptionTimerDisplay";
import { ExtendSubscriptionModal } from "@/components/subscription/ExtendSubscriptionModal";
import { TerminateSubscriptionModal } from "@/components/subscription/TerminateSubscriptionModal";
import { useSubscriptionTimer } from "@/hooks/useSubscriptionTimer";
import { getSubscriptionHistory } from "@/services/subscriptionTimerService";

interface School {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface SchoolStats {
  students: number;
  teachers: number;
  classes: number;
}

interface SchoolAdmin {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
}

interface SubscriptionHistoryEntry {
  id: number;
  action_type: string;
  previous_end_date: string | null;
  new_end_date: string | null;
  days_added: number | null;
  code_used: string | null;
  termination_reason: string | null;
  created_at: string;
}

export default function SchoolDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<SchoolStats>({ students: 0, teachers: 0, classes: 0 });
  const [admin, setAdmin] = useState<SchoolAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryEntry[]>([]);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);

  // Subscription timer hook
  const { timeRemaining, subscriptionStatus, endDate, isLoading: timerLoading, refetch: refetchTimer } = useSubscriptionTimer(id || '');

  useEffect(() => {
    if (id) {
      fetchSchoolData();
    }
  }, [id]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);

      // Fetch school details
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', id)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      // Fetch statistics
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', id)
          .is('deleted_at', null),
        supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', id)
          .is('deleted_at', null),
        supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', id)
          .is('deleted_at', null),
      ]);

      setStats({
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        classes: classesRes.count || 0,
      });

      // Fetch school admin
      const { data: membershipData } = await supabase
        .from('school_memberships')
        .select('user_id')
        .eq('school_id', id)
        .eq('role', 'school_admin')
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(1)
        .single();

      if (membershipData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', membershipData.user_id)
          .single();

        if (profileData) {
          setAdmin(profileData);
        }
      }

      // Fetch subscription history
      const history = await getSubscriptionHistory(id!);
      setSubscriptionHistory(history);
    } catch (error) {
      console.error('Error fetching school data:', error);
      toast({
        title: "Error",
        description: "Failed to load school details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async () => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schools')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School deleted successfully.",
      });

      navigate('/super-admin/schools');
    } catch (error) {
      console.error('Error deleting school:', error);
      toast({
        title: "Error",
        description: "Failed to delete school. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="super-admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading school details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!school) {
    return (
      <DashboardLayout role="super-admin">
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">School Not Found</h2>
          <p className="text-muted-foreground mb-6">The school you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/super-admin/schools">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schools
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/super-admin/schools">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
            {school.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{school.name}</h1>
              <Badge variant={school.is_active ? "default" : "secondary"}>
                {school.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {school.address && (
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {school.address}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to={`/super-admin/schools/${school.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit School
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setExtendModalOpen(true)}>
            <Zap className="h-4 w-4" />
            Extend Subscription
          </Button>
          <Button variant="destructive" onClick={() => setTerminateModalOpen(true)}>
            Terminate
          </Button>
          <Button variant="destructive" onClick={handleDeleteSchool}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.students.toString()}
          change="Enrolled"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Teachers"
          value={stats.teachers.toString()}
          change="Active staff"
          changeType="neutral"
          icon={GraduationCap}
        />
        <StatCard
          title="Classes"
          value={stats.classes.toString()}
          change="All levels"
          changeType="neutral"
          icon={Building}
        />
      </div>

      {/* Subscription Timer Section */}
      <div className="mb-8">
        <SubscriptionTimerDisplay
          timeRemaining={timeRemaining}
          status={subscriptionStatus}
          endDate={endDate}
          isTerminated={subscriptionStatus === 'terminated'}
          isLoading={timerLoading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* School Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">School Information</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="font-medium text-foreground flex items-center gap-2">
                  {school.phone ? (
                    <>
                      <Phone className="h-4 w-4" />
                      {school.phone}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium text-foreground flex items-center gap-2">
                  {school.email ? (
                    <>
                      <Mail className="h-4 w-4" />
                      {school.email}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Joined Platform</label>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(school.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p className="font-medium text-foreground">
                  {school.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Contact */}
          {admin && (
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">School Administrator</h2>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {admin.first_name?.charAt(0) || admin.email.charAt(0)}
                  {admin.last_name?.charAt(0) || ''}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {admin.first_name && admin.last_name
                      ? `${admin.first_name} ${admin.last_name}`
                      : admin.email}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="h-3 w-3" />
                    {admin.email}
                  </p>
                  {admin.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3" />
                      {admin.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscription History */}
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Subscription History
            </h2>
            {subscriptionHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No subscription history yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {subscriptionHistory.map((entry) => (
                  <div key={entry.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-foreground capitalize">
                        {entry.action_type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {entry.previous_end_date && (
                        <div>
                          <span className="text-muted-foreground">From:</span>
                          <div className="font-medium">
                            {new Date(entry.previous_end_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {entry.new_end_date && (
                        <div>
                          <span className="text-muted-foreground">To:</span>
                          <div className="font-medium">
                            {new Date(entry.new_end_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {entry.days_added && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Days Added:</span>
                          <div className="font-medium">{entry.days_added} days</div>
                        </div>
                      )}
                      {entry.code_used && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Code:</span>
                          <div className="font-medium font-mono text-xs">{entry.code_used}</div>
                        </div>
                      )}
                      {entry.termination_reason && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Reason:</span>
                          <div className="font-medium">{entry.termination_reason}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card p-6 rounded-2xl border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/super-admin/schools/${school.id}/students`}>
                <Users className="h-4 w-4 mr-2" />
                View Students
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/super-admin/schools/${school.id}/teachers`}>
                <GraduationCap className="h-4 w-4 mr-2" />
                View Teachers
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/super-admin/schools/${school.id}/classes`}>
                <Building className="h-4 w-4 mr-2" />
                View Classes
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Extend Subscription Modal */}
      <ExtendSubscriptionModal
        open={extendModalOpen}
        onOpenChange={setExtendModalOpen}
        schoolId={school.id}
        currentEndDate={endDate}
        onSuccess={() => {
          refetchTimer();
          fetchSchoolData();
          setExtendModalOpen(false);
        }}
      />

      {/* Terminate Subscription Modal */}
      <TerminateSubscriptionModal
        open={terminateModalOpen}
        onOpenChange={setTerminateModalOpen}
        schoolId={school.id}
        schoolName={school.name}
        onSuccess={() => {
          refetchTimer();
          fetchSchoolData();
          setTerminateModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
}