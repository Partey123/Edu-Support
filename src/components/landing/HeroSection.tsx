import { Link } from "react-router-dom";
import { ArrowRight, Play, CheckCircle, Users, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "500+", label: "Schools" },
  { value: "50K+", label: "Students" },
  { value: "3K+", label: "Teachers" },
  { value: "99.9%", label: "Uptime" },
];

const highlights = [
  "No setup fees or hidden costs",
  "Free training and support",
  "Ghana-specific curriculum support",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-28 lg:pt-36 pb-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-up">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                #1 School Management Platform in Ghana
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Transforming{" "}
              <span className="text-gradient-primary">Education</span>{" "}
              Management in Ghana
            </h1>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              EduSupport empowers basic schools across Ghana with powerful tools for student management, 
              attendance tracking, grading, and comprehensive reporting all in one simple platform.
            </p>

            {/* Highlights */}
            <ul className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Button size="xl" variant="heroGold" asChild>
                <Link to="/signup">
                  Start Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="heroOutline" asChild>
                <Link to="#demo">
                  <Play className="h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-12 pt-12 border-t border-border animate-fade-up" style={{ animationDelay: "0.5s" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-primary p-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
                  <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
                  <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
                </div>
                <div className="flex-1 h-6 bg-primary-foreground/10 rounded-md" />
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Users, label: "Students", value: "1,234" },
                    { icon: GraduationCap, label: "Teachers", value: "56" },
                    { icon: BookOpen, label: "Classes", value: "24" },
                  ].map((item) => (
                    <div key={item.label} className="bg-secondary/50 rounded-xl p-4 text-center">
                      <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="text-xl font-bold text-foreground">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mock Chart */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t-sm relative overflow-hidden"
                        style={{ height: `${height}%` }}
                      >
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-primary rounded-t-sm"
                          style={{ height: `${height * 0.7}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">Mon</span>
                    <span className="text-[10px] text-muted-foreground">Sun</span>
                  </div>
                </div>

                {/* Mock List */}
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/20" />
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded w-24 mb-1" />
                        <div className="h-2 bg-muted/50 rounded w-16" />
                      </div>
                      <div className="h-6 w-16 bg-accent/30 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-xl shadow-gold animate-float font-semibold text-sm">
              ✓ 98% Attendance Today
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border border-border px-4 py-2 rounded-xl shadow-lg animate-float font-semibold text-sm" style={{ animationDelay: "0.5s" }}>
              📊 Reports Ready
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
