import { Settings as SettingsIcon, User, Bell, Shield, School, Palette, Globe, CreditCard, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";

const settingsSections = [
  { 
    icon: School, 
    title: "School Profile", 
    description: "Update school name, logo, and contact information",
    action: "Edit Profile"
  },
  { 
    icon: User, 
    title: "User Management", 
    description: "Manage admin accounts and user permissions",
    action: "Manage Users"
  },
  { 
    icon: Bell, 
    title: "Notifications", 
    description: "Configure email, SMS, and push notification settings",
    action: "Configure"
  },
  { 
    icon: Shield, 
    title: "Security", 
    description: "Password policies, two-factor authentication, and access logs",
    action: "Security Settings"
  },
  { 
    icon: Palette, 
    title: "Appearance", 
    description: "Customize colors, themes, and branding",
    action: "Customize"
  },
  { 
    icon: Globe, 
    title: "Localization", 
    description: "Language, timezone, and regional settings",
    action: "Configure"
  },
];

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    period: "month",
    description: "Perfect for small schools",
    features: [
      "Up to 500 students",
      "Basic reporting",
      "Email support",
      "5 admin accounts",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: 79,
    period: "month",
    description: "For growing institutions",
    features: [
      "Up to 2,000 students",
      "Advanced analytics",
      "Priority support",
      "20 admin accounts",
      "Virtual classrooms",
      "API access",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "month",
    description: "For large school networks",
    features: [
      "Unlimited students",
      "Custom reporting",
      "24/7 dedicated support",
      "Unlimited admins",
      "Multi-campus support",
      "Custom integrations",
      "SLA guarantee",
    ],
    popular: false,
  },
];

const Settings = () => {
  const [currentPlan] = useState("pro");
  const [activeTab, setActiveTab] = useState<"general" | "plans">("general");

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your school's system settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={activeTab === "general" ? "default" : "outline"}
          onClick={() => setActiveTab("general")}
          className={cn(activeTab !== "general" && "glass-button")}
        >
          <SettingsIcon className="w-4 h-4 mr-2" />
          General
        </Button>
        <Button
          variant={activeTab === "plans" ? "default" : "outline"}
          onClick={() => setActiveTab("plans")}
          className={cn(activeTab !== "plans" && "glass-button")}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Plans & Billing
        </Button>
      </div>

      {activeTab === "general" && (
        <>
          {/* Settings Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {settingsSections.map((section) => (
              <div key={section.title} className="glass-card rounded-xl p-4 sm:p-6 hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{section.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{section.description}</p>
                    <Button variant="outline" size="sm" className="glass-button text-xs sm:text-sm">
                      {section.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Account Section */}
          <div className="glass-card rounded-xl p-4 sm:p-6 mt-6">
            <h3 className="font-semibold text-foreground mb-4">Account</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-background/50 rounded-xl mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl shrink-0">
                JK
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">John Kofi</h4>
                <p className="text-sm text-muted-foreground truncate">john.kofi@eduflow.com</p>
                <p className="text-xs text-primary">School Administrator</p>
              </div>
              <Button variant="outline" className="glass-button w-full sm:w-auto">
                Edit Profile
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="glass-button">
                Change Password
              </Button>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}

      {activeTab === "plans" && (
        <>
          {/* Current Plan Banner */}
          <div className="glass-card rounded-xl p-4 sm:p-6 mb-6 border-primary/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Current Plan: Professional</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Active</span>
                </div>
                <p className="text-sm text-muted-foreground">Your next billing date is January 15, 2025</p>
              </div>
              <Button variant="outline" className="glass-button w-full sm:w-auto">
                Manage Billing
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "glass-card rounded-xl p-4 sm:p-6 relative",
                  plan.popular && "ring-2 ring-primary",
                  currentPlan === plan.id && "bg-primary/5"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 sm:mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={currentPlan === plan.id ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>

          {/* Usage Stats */}
          <div className="glass-card rounded-xl p-4 sm:p-6 mt-6">
            <h3 className="font-semibold text-foreground mb-4">Usage This Month</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-1">Students</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">1,247 <span className="text-sm font-normal text-muted-foreground">/ 2,000</span></p>
                <div className="w-full h-2 bg-secondary rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: "62%" }} />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-1">Admin Accounts</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">12 <span className="text-sm font-normal text-muted-foreground">/ 20</span></p>
                <div className="w-full h-2 bg-secondary rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-1">Storage Used</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">45 GB <span className="text-sm font-normal text-muted-foreground">/ 100 GB</span></p>
                <div className="w-full h-2 bg-secondary rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Settings;
