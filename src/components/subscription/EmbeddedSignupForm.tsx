import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

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

interface EmbeddedSignupFormProps {
  onSignupSuccess: (schoolId: string, schoolName: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export function EmbeddedSignupForm({
  onSignupSuccess,
  onError,
  isLoading: externalLoading = false,
}: EmbeddedSignupFormProps) {
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.schoolName.trim()) stepErrors.schoolName = "School name is required";
      if (!formData.region) stepErrors.region = "Region is required";
      if (!formData.phone.trim()) stepErrors.phone = "Phone number is required";
    } else if (step === 2) {
      if (!formData.adminName.trim()) stepErrors.adminName = "Admin name is required";
      if (!formData.email.trim()) stepErrors.email = "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = "Please enter a valid email";
      }
    } else if (step === 3) {
      if (!formData.password.trim()) stepErrors.password = "Password is required";
      if (formData.password.length < 6) stepErrors.password = "Password must be at least 6 characters";
      if (!formData.confirmPassword.trim()) stepErrors.confirmPassword = "Please confirm your password";
      if (formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = "Passwords don't match";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) return;

    setIsLoading(true);

    try {
      const nameParts = formData.adminName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      console.log('🔄 Creating account...');

      // Step 1: Create the account via Edge Function
      const { data: signupData, error: signupError } = await supabase.functions.invoke('signup-school', {
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

      if (signupError) {
        throw new Error(signupError.message || 'Failed to create account');
      }

      if (signupData?.error) {
        let message = signupData.error;
        if (signupData.error.includes('already registered') || signupData.details?.includes('already')) {
          message = 'This email is already registered. Please sign in instead.';
        }
        throw new Error(message);
      }

      console.log('✅ Account created successfully');

      // Step 2: Sign in the user immediately
      console.log('🔐 Signing in user...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('❌ Sign in error:', authError);
        throw new Error('Account created but failed to sign in. Please use the login page.');
      }

      if (!authData.user) {
        throw new Error('Sign in failed - no user returned');
      }

      console.log('✅ User signed in:', authData.user.id);

      // Step 3: Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Verify we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session after sign in');
      }

      console.log('✅ Session verified');

      // Success - call callback with school info
      onSignupSuccess(signupData?.school_id, formData.schoolName);

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error('❌ Signup error:', message);
      onError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                stepNum === step
                  ? 'bg-primary text-primary-foreground'
                  : stepNum < step
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {stepNum < step ? '✓' : stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`h-1 w-16 mx-2 transition-colors ${
                  stepNum < step ? 'bg-success' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: School Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">School Information</h3>

            <div>
              <Label htmlFor="schoolName">School Name *</Label>
              <div className="relative mt-2">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="schoolName"
                  placeholder="Enter your school name"
                  value={formData.schoolName}
                  onChange={(e) => updateFormData('schoolName', e.target.value)}
                  className={errors.schoolName ? 'border-destructive pl-10' : 'pl-10'}
                  disabled={isLoading || externalLoading}
                />
              </div>
              {errors.schoolName && (
                <p className="text-sm text-destructive mt-1">{errors.schoolName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="region">Region *</Label>
              <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                <SelectTrigger id="region" className={errors.region ? 'border-destructive' : ''}>
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
                <p className="text-sm text-destructive mt-1">{errors.region}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">School Phone Number *</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={errors.phone ? 'border-destructive pl-10' : 'pl-10'}
                  disabled={isLoading || externalLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading || externalLoading}
              className="w-full gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Admin Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Administrator Details</h3>

            <div>
              <Label htmlFor="adminName">Full Name *</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="adminName"
                  placeholder="Enter your full name"
                  value={formData.adminName}
                  onChange={(e) => updateFormData('adminName', e.target.value)}
                  className={errors.adminName ? 'border-destructive pl-10' : 'pl-10'}
                  disabled={isLoading || externalLoading}
                />
              </div>
              {errors.adminName && (
                <p className="text-sm text-destructive mt-1">{errors.adminName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={errors.email ? 'border-destructive pl-10' : 'pl-10'}
                  disabled={isLoading || externalLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading || externalLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading || externalLoading}
                className="flex-1 gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Set Password</h3>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className={errors.password ? 'border-destructive pl-10 pr-10' : 'pl-10 pr-10'}
                  disabled={isLoading || externalLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || externalLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-destructive pl-10 pr-10' : 'pl-10 pr-10'}
                  disabled={isLoading || externalLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || externalLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                Password must be at least 6 characters. Use a combination of uppercase, lowercase, and numbers for security.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading || externalLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || externalLoading}
                className="flex-1 gap-2"
              >
                {isLoading || externalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}