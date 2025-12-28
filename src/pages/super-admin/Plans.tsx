// pages/super-admin/Plans.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Edit, Eye, EyeOff, Loader2, Plus, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionPlan } from "@/types/subscription";

export default function PlansManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans((data as unknown as SubscriptionPlan[]) || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (plan: SubscriptionPlan) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('subscription_plans')
        .update({
          display_name: plan.display_name,
          description: plan.description,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          max_students: plan.max_students,
          max_teachers: plan.max_teachers,
          max_classes: plan.max_classes,
          max_video_participants: plan.max_video_participants,
          features: plan.features as any,
          is_active: plan.is_active,
          is_visible: plan.is_visible,
          billing_description: plan.billing_description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan updated successfully",
      });

      await loadPlans();
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (planId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_visible: !currentVisibility })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Plan ${!currentVisibility ? 'shown' : 'hidden'} on pricing page`,
      });

      await loadPlans();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update plan visibility",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="super-admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Subscription Plans
        </h1>
        <p className="text-muted-foreground">
          Manage pricing, features, and limits for all subscription plans
        </p>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                    {!plan.is_visible && (
                      <Badge variant="secondary">Hidden</Badge>
                    )}
                    {!plan.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(plan.id, plan.is_visible)}
                  >
                    {plan.is_visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/super-admin/plans/${plan.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit {plan.display_name}</DialogTitle>
                        <DialogDescription>
                          Update pricing, features, and limits for this plan
                        </DialogDescription>
                      </DialogHeader>
                      {editingPlan && editingPlan.id === plan.id && (
                        <EditPlanForm
                          plan={editingPlan}
                          onChange={setEditingPlan}
                          onSave={handleSavePlan}
                          saving={saving}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {/* Pricing */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Pricing</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground">
                      GHS {plan.price_monthly ? plan.price_monthly.toLocaleString() : 'N/A'}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      GHS {plan.price_yearly.toLocaleString()}/yr
                    </p>
                  </div>
                </div>

                {/* Limits */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Limits</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground">
                      Students: {plan.max_students ? plan.max_students.toLocaleString() : '∞'}
                    </p>
                    <p className="text-foreground">
                      Teachers: {plan.max_teachers ? plan.max_teachers.toLocaleString() : '∞'}
                    </p>
                    <p className="text-foreground">
                      Video: {plan.max_video_participants}
                    </p>
                  </div>
                </div>

                {/* Features Count */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Object.values(plan.features).filter(Boolean).length}
                  </p>
                  <p className="text-xs text-muted-foreground">enabled</p>
                </div>

                {/* Status */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                  <div className="flex flex-col gap-2">
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={plan.is_visible ? "default" : "secondary"}>
                      {plan.is_visible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

// Edit Plan Form Component
function EditPlanForm({ 
  plan, 
  onChange, 
  onSave, 
  saving 
}: { 
  plan: SubscriptionPlan; 
  onChange: (plan: SubscriptionPlan) => void;
  onSave: (plan: SubscriptionPlan) => void;
  saving: boolean;
}) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="pricing">Pricing & Limits</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={plan.display_name}
            onChange={(e) => onChange({ ...plan, display_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={plan.description || ''}
            onChange={(e) => onChange({ ...plan, description: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <p className="font-medium">Active</p>
            <p className="text-sm text-muted-foreground">Plan can be subscribed to</p>
          </div>
          <Switch
            checked={plan.is_active}
            onCheckedChange={(checked) => onChange({ ...plan, is_active: checked })}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <p className="font-medium">Visible</p>
            <p className="text-sm text-muted-foreground">Show on pricing page</p>
          </div>
          <Switch
            checked={plan.is_visible}
            onCheckedChange={(checked) => onChange({ ...plan, is_visible: checked })}
          />
        </div>
      </TabsContent>

      <TabsContent value="pricing" className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price_monthly">Monthly Price (GHS)</Label>
            <Input
              id="price_monthly"
              type="number"
              value={plan.price_monthly || ''}
              onChange={(e) => onChange({ ...plan, price_monthly: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="Leave empty for yearly-only"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_yearly">Yearly Price (GHS)</Label>
            <Input
              id="price_yearly"
              type="number"
              value={plan.price_yearly}
              onChange={(e) => onChange({ ...plan, price_yearly: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_students">Max Students</Label>
            <Input
              id="max_students"
              type="number"
              value={plan.max_students || ''}
              onChange={(e) => onChange({ ...plan, max_students: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Leave empty for unlimited"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_teachers">Max Teachers</Label>
            <Input
              id="max_teachers"
              type="number"
              value={plan.max_teachers || ''}
              onChange={(e) => onChange({ ...plan, max_teachers: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_classes">Max Classes</Label>
            <Input
              id="max_classes"
              type="number"
              value={plan.max_classes || ''}
              onChange={(e) => onChange({ ...plan, max_classes: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Leave empty for unlimited"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_video_participants">Max Video Participants</Label>
            <Input
              id="max_video_participants"
              type="number"
              value={plan.max_video_participants}
              onChange={(e) => onChange({ ...plan, max_video_participants: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="features" className="space-y-3">
        {Object.entries(plan.features).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p>
            <Switch
              checked={value}
              onCheckedChange={(checked) => 
                onChange({ 
                  ...plan, 
                  features: { ...plan.features, [key]: checked } 
                })
              }
            />
          </div>
        ))}
      </TabsContent>

      <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
        <Button onClick={() => onSave(plan)} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </Tabs>
  );
}