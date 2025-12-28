import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Bell, Shield, Globe, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PlatformSettings {
  platform_name: string;
  support_email: string;
  default_currency: string;
  timezone: string;
  terms_url: string;
  allow_registration: boolean;
  enable_free_trial: boolean;
  enable_payments: boolean;
  enable_sms: boolean;
}

interface NotificationSettings {
  notify_new_school: boolean;
  notify_payment: boolean;
  notify_trial_expiring: boolean;
  notify_system_alerts: boolean;
}

interface SecuritySettings {
  require_2fa: boolean;
  session_timeout: boolean;
  ip_whitelist: boolean;
  audit_logging: boolean;
}

export default function SuperAdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platform_name: "EduGhana SaaS",
    support_email: "support@edumanage.com",
    default_currency: "GHS",
    timezone: "Africa/Accra (GMT+0)",
    terms_url: "https://edumanage.com/terms",
    allow_registration: true,
    enable_free_trial: true,
    enable_payments: true,
    enable_sms: false,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    notify_new_school: true,
    notify_payment: true,
    notify_trial_expiring: true,
    notify_system_alerts: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    require_2fa: true,
    session_timeout: true,
    ip_whitelist: false,
    audit_logging: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // In a real implementation, you might store settings in a dedicated table
      // For now, we'll use localStorage as a simple solution
      const savedPlatform = localStorage.getItem('platform_settings');
      const savedNotifications = localStorage.getItem('notification_settings');
      const savedSecurity = localStorage.getItem('security_settings');

      if (savedPlatform) {
        setPlatformSettings(JSON.parse(savedPlatform));
      }
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }
      if (savedSecurity) {
        setSecuritySettings(JSON.parse(savedSecurity));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePlatformSettings = async () => {
    try {
      setSaving(true);

      // Save to localStorage (in production, save to a settings table)
      localStorage.setItem('platform_settings', JSON.stringify(platformSettings));

      // Log the action in audit log
      if (user) {
        await supabase.from('super_admin_audit_log').insert({
          super_admin_id: user.id,
          action: 'update_platform_settings',
          target_type: 'settings',
          details: platformSettings,
        });
      }

      toast({
        title: "Success",
        description: "Platform settings saved successfully.",
      });
    } catch (error) {
      console.error('Error saving platform settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);

      localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));

      if (user) {
        await supabase.from('super_admin_audit_log').insert({
          super_admin_id: user.id,
          action: 'update_notification_settings',
          target_type: 'settings',
          details: notificationSettings,
        });
      }

      toast({
        title: "Success",
        description: "Notification settings saved successfully.",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSecuritySettings = async () => {
    try {
      setSaving(true);

      localStorage.setItem('security_settings', JSON.stringify(securitySettings));

      if (user) {
        await supabase.from('super_admin_audit_log').insert({
          super_admin_id: user.id,
          action: 'update_security_settings',
          target_type: 'settings',
          details: securitySettings,
        });
      }

      toast({
        title: "Success",
        description: "Security settings saved successfully.",
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
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
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super-admin">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage platform-wide settings and configurations.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>Configure general platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input 
                      id="platform-name" 
                      value={platformSettings.platform_name}
                      onChange={(e) => setPlatformSettings({
                        ...platformSettings,
                        platform_name: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input 
                      id="support-email" 
                      type="email" 
                      value={platformSettings.support_email}
                      onChange={(e) => setPlatformSettings({
                        ...platformSettings,
                        support_email: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Input 
                      id="default-currency" 
                      value={platformSettings.default_currency}
                      onChange={(e) => setPlatformSettings({
                        ...platformSettings,
                        default_currency: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input 
                      id="timezone" 
                      value={platformSettings.timezone}
                      onChange={(e) => setPlatformSettings({
                        ...platformSettings,
                        timezone: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms of Service URL</Label>
                  <Input 
                    id="terms" 
                    value={platformSettings.terms_url}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      terms_url: e.target.value
                    })}
                  />
                </div>
                <Button onClick={savePlatformSettings} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">School Registration</p>
                    <p className="text-sm text-muted-foreground">Allow new schools to register</p>
                  </div>
                  <Switch 
                    checked={platformSettings.allow_registration}
                    onCheckedChange={(checked) => setPlatformSettings({
                      ...platformSettings,
                      allow_registration: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Free Trial</p>
                    <p className="text-sm text-muted-foreground">Enable 14-day free trial for new schools</p>
                  </div>
                  <Switch 
                    checked={platformSettings.enable_free_trial}
                    onCheckedChange={(checked) => setPlatformSettings({
                      ...platformSettings,
                      enable_free_trial: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Payment Integration</p>
                    <p className="text-sm text-muted-foreground">Enable Paystack/MTN MoMo payments</p>
                  </div>
                  <Switch 
                    checked={platformSettings.enable_payments}
                    onCheckedChange={(checked) => setPlatformSettings({
                      ...platformSettings,
                      enable_payments: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Enable SMS notifications for schools</p>
                  </div>
                  <Switch 
                    checked={platformSettings.enable_sms}
                    onCheckedChange={(checked) => setPlatformSettings({
                      ...platformSettings,
                      enable_sms: checked
                    })}
                  />
                </div>
                <Button onClick={savePlatformSettings} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Feature Flags
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">New School Registration</p>
                  <p className="text-sm text-muted-foreground">Get notified when a new school registers</p>
                </div>
                <Switch 
                  checked={notificationSettings.notify_new_school}
                  onCheckedChange={(checked) => setNotificationSettings({
                    ...notificationSettings,
                    notify_new_school: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Payment Received</p>
                  <p className="text-sm text-muted-foreground">Get notified for subscription payments</p>
                </div>
                <Switch 
                  checked={notificationSettings.notify_payment}
                  onCheckedChange={(checked) => setNotificationSettings({
                    ...notificationSettings,
                    notify_payment: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Trial Expiring</p>
                  <p className="text-sm text-muted-foreground">Notify when school trials are expiring</p>
                </div>
                <Switch 
                  checked={notificationSettings.notify_trial_expiring}
                  onCheckedChange={(checked) => setNotificationSettings({
                    ...notificationSettings,
                    notify_trial_expiring: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">System Alerts</p>
                  <p className="text-sm text-muted-foreground">Critical system and security alerts</p>
                </div>
                <Switch 
                  checked={notificationSettings.notify_system_alerts}
                  onCheckedChange={(checked) => setNotificationSettings({
                    ...notificationSettings,
                    notify_system_alerts: checked
                  })}
                />
              </div>
              <Button onClick={saveNotificationSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Configuration
              </CardTitle>
              <CardDescription>Configure subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-border rounded-xl">
                  <h3 className="font-semibold text-foreground mb-2">Starter</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-xl font-bold text-primary">GHS 500<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-sm text-muted-foreground">GHS 5,000/year</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Up to 500 students</p>
                  <p className="text-xs text-muted-foreground mt-1">Small Schools</p>
                </div>
                <div className="p-4 border border-primary rounded-xl bg-primary/5">
                  <h3 className="font-semibold text-foreground mb-2">Pro</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-xl font-bold text-primary">GHS 950<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-sm text-muted-foreground">GHS 9,500/year</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Unlimited students</p>
                  <p className="text-xs text-muted-foreground mt-1">Growing Schools</p>
                </div>
                <div className="p-4 border border-border rounded-xl">
                  <h3 className="font-semibold text-foreground mb-2">Pro+</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-xl font-bold text-primary">GHS 1,500<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-sm text-muted-foreground">GHS 15,000/year</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Unlimited students</p>
                  <p className="text-xs text-muted-foreground mt-1">Large Institutions</p>
                </div>
                <div className="p-4 border border-border rounded-xl">
                  <h3 className="font-semibold text-foreground mb-2">Enterprise</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-xl font-bold text-primary">Custom</p>
                    <p className="text-sm text-muted-foreground">GHS 45,000 (5-year)</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Unlimited students</p>
                  <p className="text-xs text-muted-foreground mt-1">Universities / Networks</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Pricing plan management coming soon. Contact development team to modify plans.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure platform security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch 
                  checked={securitySettings.require_2fa}
                  onCheckedChange={(checked) => setSecuritySettings({
                    ...securitySettings,
                    require_2fa: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
                </div>
                <Switch 
                  checked={securitySettings.session_timeout}
                  onCheckedChange={(checked) => setSecuritySettings({
                    ...securitySettings,
                    session_timeout: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">IP Whitelisting</p>
                  <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                </div>
                <Switch 
                  checked={securitySettings.ip_whitelist}
                  onCheckedChange={(checked) => setSecuritySettings({
                    ...securitySettings,
                    ip_whitelist: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">Log all admin actions</p>
                </div>
                <Switch 
                  checked={securitySettings.audit_logging}
                  onCheckedChange={(checked) => setSecuritySettings({
                    ...securitySettings,
                    audit_logging: checked
                  })}
                />
              </div>
              <Button onClick={saveSecuritySettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}