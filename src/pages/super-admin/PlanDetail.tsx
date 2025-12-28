// pages/super-admin/PlanDetail.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, Trash2, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionPlan, SubscriptionFeatures } from "@/types/subscription";

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlan();
    }
  }, [id]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPlan(data as unknown as SubscriptionPlan);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast({
        title: "Error",
        description: "Failed to load plan details",
        variant: "destructive",
      });
      navigate('/super-admin/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SubscriptionPlan, value: any) => {
    if (plan) {
      setPlan({ ...plan, [field]: value });
      setHasChanges(true);
    }
  };

  const handleFeatureChange = (featureName: string, value: boolean) => {
    if (plan) {
      const features = plan.features || {} as SubscriptionFeatures;
      setPlan({
        ...plan,
        features: { ...features, [featureName]: value } as SubscriptionFeatures
      });
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    if (!plan) return;

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
          max_video_participants: plan.max_video_participants,
          features: plan.features as any,
          is_active: plan.is_active,
          is_visible: plan.is_visible,
          sort_order: plan.sort_order,
        })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan updated successfully",
      });

      setHasChanges(false);
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

  const handleDelete = async () => {
    if (!plan) return;

    if (!window.confirm(`Are you sure you want to delete the ${plan.display_name} plan?`)) {
      return;
    }

    try {
      setSaving(true);

      // Soft delete by marking as inactive
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false, is_visible: false })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });

      navigate('/super-admin/plans');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  if (!plan) {
    return (
      <DashboardLayout role="super-admin">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Plan not found</p>
          <Button onClick={() => navigate('/super-admin/plans')}>
            Back to Plans
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/super-admin/plans')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {plan.display_name}
            </h1>
            <p className="text-muted-foreground">
              View and manage plan details
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Plan
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              size="sm"
            >
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
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {!plan.is_active && (
            <Badge variant="destructive">Inactive</Badge>
          )}
          {plan.is_active && (
            <Badge className="bg-success">Active</Badge>
          )}
          {!plan.is_visible && (
            <Badge variant="secondary">Hidden from pricing</Badge>
          )}
          {plan.is_visible && (
            <Badge variant="outline">Visible on pricing</Badge>
          )}
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Limits</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="display_name">Plan Name *</Label>
                  <Input
                    id="display_name"
                    value={plan.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="e.g., Professional Plan"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={plan.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of this plan"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={plan.sort_order || 0}
                      onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Plan can be purchased and used
                      </p>
                    </div>
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={(checked) =>
                        handleInputChange('is_active', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Visible on Pricing Page</Label>
                      <p className="text-sm text-muted-foreground">
                        Show this plan to customers
                      </p>
                    </div>
                    <Switch
                      checked={plan.is_visible}
                      onCheckedChange={(checked) =>
                        handleInputChange('is_visible', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing & Limits Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price_monthly">Monthly Price (GHS) *</Label>
                  <Input
                    id="price_monthly"
                    type="number"
                    step="0.01"
                    value={plan.price_monthly || ''}
                    onChange={(e) => handleInputChange('price_monthly', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="price_yearly">Yearly Price (GHS) *</Label>
                  <Input
                    id="price_yearly"
                    type="number"
                    step="0.01"
                    value={plan.price_yearly}
                    onChange={(e) => handleInputChange('price_yearly', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>

                {plan.price_monthly && plan.price_yearly && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      Annual savings: <strong>{Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)}%</strong>
                    </p>
                  </div>
                )}

                <Separator />

                <h3 className="font-semibold mt-6">Usage Limits</h3>

                <div>
                  <Label htmlFor="max_students">Max Students (0 = Unlimited)</Label>
                  <Input
                    id="max_students"
                    type="number"
                    value={plan.max_students || 0}
                    onChange={(e) => handleInputChange('max_students', parseInt(e.target.value) || null)}
                    placeholder="0 for unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="max_teachers">Max Teachers (0 = Unlimited)</Label>
                  <Input
                    id="max_teachers"
                    type="number"
                    value={plan.max_teachers || 0}
                    onChange={(e) => handleInputChange('max_teachers', parseInt(e.target.value) || null)}
                    placeholder="0 for unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="max_video_participants">Max Video Participants</Label>
                  <Input
                    id="max_video_participants"
                    type="number"
                    value={plan.max_video_participants || 0}
                    onChange={(e) => handleInputChange('max_video_participants', parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
                <CardDescription>
                  Enable or disable features for this plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features && Object.keys(plan.features).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(plan.features).map(([featureName, enabled]: [string, any]) => (
                      <div
                        key={featureName}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Check className={`h-4 w-4 ${enabled ? 'text-success' : 'text-muted-foreground'}`} />
                          <Label className="capitalize cursor-pointer">
                            {featureName.replace(/_/g, ' ')}
                          </Label>
                        </div>
                        <Switch
                          checked={enabled as boolean}
                          onCheckedChange={(checked) =>
                            handleFeatureChange(featureName as string, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No features configured for this plan
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription>
              You have unsaved changes. Click "Save Changes" to apply them.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
