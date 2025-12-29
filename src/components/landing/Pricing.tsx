import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small schools just getting started",
      price: "99",
      currency: "GHS",
      period: "/month",
      students: "Up to 200 students",
      features: [
        "Student & Staff Management",
        "Attendance Tracking",
        "Fee Collection",
        "Basic Reports",
        "SMS Notifications (100/month)",
        "Email Support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      description: "For growing schools that need more power",
      price: "249",
      currency: "GHS",
      period: "/month",
      students: "Up to 500 students",
      features: [
        "Everything in Starter",
        "Exam Management & Report Cards",
        "Timetable Automation",
        "Library Management",
        "Parent & Student Portals",
        "SMS Notifications (500/month)",
        "WhatsApp Integration",
        "Priority Support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large institutions with complex needs",
      price: "Custom",
      currency: "",
      period: "",
      students: "Unlimited students",
      features: [
        "Everything in Professional",
        "Multi-Campus Support",
        "Transport & GPS Tracking",
        "Hostel Management",
        "Advanced Analytics & AI",
        "Custom Integrations",
        "Unlimited SMS & WhatsApp",
        "Dedicated Account Manager",
        "On-site Training",
        "SLA Guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose the Plan That{" "}
            <span className="text-gradient">Fits Your School</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? "bg-card border-primary shadow-glow scale-[1.02]"
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {plan.currency && (
                    <span className="text-lg font-medium text-muted-foreground">{plan.currency}</span>
                  )}
                  <span className="text-4xl md:text-5xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.students}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full"
                size="lg"
                asChild
              >
                <Link to="/dashboard">
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Need a custom solution? We offer special pricing for NGOs, government schools, and educational groups.
          </p>
          <Button variant="link" className="text-primary">
            Contact our sales team <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
