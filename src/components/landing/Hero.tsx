import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Users, School, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const stats = [
    { icon: School, value: "500+", label: "Schools" },
    { icon: Users, value: "50K+", label: "Students" },
    { icon: BookOpen, value: "99.9%", label: "Uptime" },
  ];

  const features = [
    "Multi-tenant architecture",
    "Offline-first design",
    "Mobile money integration",
  ];

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden gradient-hero">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Built for African Schools
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              The Complete <span className="text-gradient">School Management</span> Platform
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Streamline administration, enhance learning, and connect your school community with an all-in-one solution designed for the African education market.
            </p>

            {/* Features list */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-border animate-fade-up" style={{ animationDelay: "0.5s" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative z-10">
              {/* Main Dashboard Card */}
              <div className="bg-card rounded-2xl shadow-elevated p-4 md:p-6 border border-border">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground">School Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Academic Year 2024/2025</p>
                  </div>
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-bold">JK</span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Total Students", value: "1,247", change: "+12%", color: "bg-primary/10 text-primary" },
                    { label: "Attendance Rate", value: "94.2%", change: "+3%", color: "bg-accent/10 text-accent" },
                    { label: "Fee Collection", value: "₵45.2K", change: "+8%", color: "bg-emerald-100 text-emerald-600" },
                    { label: "Active Teachers", value: "56", change: "+2", color: "bg-violet-100 text-violet-600" },
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl ${stat.color.split(" ")[0]}`}>
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <span className={`text-xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</span>
                        <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Add Student
                  </button>
                  <button className="flex-1 py-2 px-3 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                    View Reports
                  </button>
                </div>
              </div>

              {/* Floating Card 1 */}
              <div className="absolute -top-4 -right-4 md:-right-8 bg-card rounded-xl shadow-card-hover p-3 border border-border animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Fees Paid</p>
                    <p className="text-xs text-muted-foreground">₵250 just now</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute -bottom-4 -left-4 md:-left-8 bg-card rounded-xl shadow-card-hover p-3 border border-border animate-float" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">New Admission</p>
                    <p className="text-xs text-muted-foreground">Form 1 - Gold</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-3xl -z-10 scale-110" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
