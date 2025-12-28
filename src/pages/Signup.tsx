import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/layout/Logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const regions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Oti",
  "Western North",
];

const benefits = [
  "14-day free trial, no credit card required",
  "Full access to all features",
  "Unlimited students during trial",
  "Free onboarding support",
];

const signupSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  region: z.string().min(1, "Please select a region"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  adminName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: "",
    region: "",
    phone: "",
    adminName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const { signUp, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/school-admin/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Parse admin name into first and last name
      const nameParts = formData.adminName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Call the edge function to handle signup (bypasses RLS issues)
      const { data, error } = await supabase.functions.invoke('signup-school', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
          schoolName: formData.schoolName,
          schoolAddress: formData.region,
          schoolPhone: formData.phone,
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Failed to create account');
      }

      if (data?.error) {
        let message = data.error;
        if (data.error.includes('already registered') || data.details?.includes('already')) {
          message = 'This email is already registered. Please sign in instead.';
        }
        throw new Error(message);
      }

      toast({
        title: "Account created!",
        description: "Activate your school to get started!",
      });

      // Redirect to activation page with school info
      navigate('/school/activation', {
        state: {
          schoolId: data?.school_id,
          schoolName: formData.schoolName,
          fromSignup: true
        }
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative text-primary-foreground max-w-md">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Free Trial Today
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Transform how you manage your school with Ghana's leading school management platform.
          </p>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="text-primary-foreground/90">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm">
            <p className="italic text-primary-foreground/80 mb-4">
              "EduSupport has revolutionized how we manage our school. The setup was quick and the support team is amazing!"
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground">
                AM
              </div>
              <div>
                <div className="font-semibold">Mrs. Akosua Mensah</div>
                <div className="text-sm text-primary-foreground/70">Headmistress, Bright Future Basic School</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Logo size="lg" linkTo="/" />
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                {step === 1 ? "Tell us about your school" : "Set up your admin account"}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="schoolName"
                        type="text"
                        placeholder="e.g., Bright Future Basic School"
                        value={formData.schoolName}
                        onChange={(e) => updateFormData("schoolName", e.target.value)}
                        className={`pl-10 ${errors.schoolName ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.schoolName && (
                      <p className="text-sm text-destructive">{errors.schoolName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select value={formData.region} onValueChange={(value) => updateFormData("region", value)}>
                      <SelectTrigger className={errors.region ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.region && (
                      <p className="text-sm text-destructive">{errors.region}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">School Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+233 XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={!formData.schoolName || !formData.region || !formData.phone}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Your Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminName"
                        type="text"
                        placeholder="e.g., Kofi Mensah"
                        value={formData.adminName}
                        onChange={(e) => updateFormData("adminName", e.target.value)}
                        className={`pl-10 ${errors.adminName ? 'border-destructive' : ''}`}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {errors.adminName && (
                      <p className="text-sm text-destructive">{errors.adminName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@school.edu.gh"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                        className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)} disabled={isLoading}>
                      Back
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By creating an account, you agree to our{" "}
            <Link to="#" className="underline hover:text-primary">Terms of Service</Link> and{" "}
            <Link to="#" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
