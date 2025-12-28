import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import type { SubscriptionPlan, BillingCycle } from "@/types/subscription";

interface OrderSummaryProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  schoolName?: string;
  schoolEmail?: string;
  discount?: number; // Discount percentage (e.g., 20 for 20%)
}

export function OrderSummary({
  plan,
  billingCycle,
  schoolName,
  schoolEmail,
  discount = 0,
}: OrderSummaryProps) {
  const basePrice = billingCycle === 'monthly' ? (plan.price_monthly || 0) : plan.price_yearly;
  const discountAmount = (basePrice * discount) / 100;
  const totalPrice = basePrice - discountAmount;

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Details */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-foreground">{plan.display_name}</p>
              <p className="text-sm text-muted-foreground">
                {billingCycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}
              </p>
            </div>
            <Badge variant="secondary" className="mt-1">
              {plan.max_students ? `${plan.max_students} Students` : 'Unlimited'}
            </Badge>
          </div>
        </div>

        {/* School Info */}
        {(schoolName || schoolEmail) && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              {schoolName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School</span>
                  <span className="font-medium text-foreground">{schoolName}</span>
                </div>
              )}
              {schoolEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground text-right truncate ml-2">
                    {schoolEmail}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pricing Breakdown */}
        <Separator className="my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Base Price ({billingCycle === 'monthly' ? 'Monthly' : 'Annual'})
            </span>
            <span className="font-medium text-foreground">
              GHS {basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span className="text-muted-foreground">
                Discount ({discount}%)
              </span>
              <span className="font-medium">
                -GHS {discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <Separator className="my-3" />

          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Amount</span>
            <span className="text-xl font-bold text-primary">
              GHS {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Renewal Information */}
        <Separator className="my-4" />
        <div className="space-y-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          {billingCycle === 'monthly' ? (
            <>
              <p>
                💡 Renews monthly on{' '}
                <strong>
                  {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                </strong>
              </p>
              <p>Save 20% when you switch to annual billing</p>
            </>
          ) : (
            <p>
              💡 Renews on{' '}
              <strong>
                {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}
              </strong>
            </p>
          )}
        </div>

        {/* Features Preview */}
        {plan.features && Object.keys(plan.features).length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Included Features:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {Object.entries(plan.features).slice(0, 3).map(([key]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-success" />
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Payment Method */}
        <Separator className="my-4" />
        <div className="text-sm">
          <p className="text-muted-foreground mb-2">Payment Method</p>
          <div className="flex items-center gap-2 p-3 bg-muted rounded">
            <div className="h-8 w-12 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
              PSK
            </div>
            <div>
              <p className="font-medium text-sm">Paystack</p>
              <p className="text-xs text-muted-foreground">Card, Mobile Money, Bank Transfer</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
