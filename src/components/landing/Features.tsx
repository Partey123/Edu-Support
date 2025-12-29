import { 
  Users, 
  CreditCard, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Bell, 
  Shield, 
  Smartphone,
  Wifi,
  Globe,
  Zap,
  Clock
} from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      icon: Users,
      title: "Student & Staff Management",
      description: "Complete profiles, digital ID cards, attendance tracking, and comprehensive record management for students and staff.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: CreditCard,
      title: "Financial Management",
      description: "Fee collection with mobile money integration (MTN, Vodafone, Airtel), payment tracking, and automated reminders.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: BookOpen,
      title: "Academic & Exams",
      description: "Curriculum management, exam scheduling, results processing, report card generation, and performance analytics.",
      color: "bg-violet-100 text-violet-600",
    },
    {
      icon: Calendar,
      title: "Timetable & Scheduling",
      description: "Automated timetable generation with conflict detection, event management, and school calendar.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Real-time dashboards, custom reports, performance trends, and data-driven insights for better decisions.",
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: Bell,
      title: "Communication Hub",
      description: "SMS, WhatsApp, and email notifications. Parent portal, announcements, and two-way messaging.",
      color: "bg-sky-100 text-sky-600",
    },
  ];

  const highlights = [
    {
      icon: Wifi,
      title: "Offline-First",
      description: "Works without internet. Syncs automatically when connection is restored.",
    },
    {
      icon: Smartphone,
      title: "Mobile-Optimized",
      description: "Full functionality on any device. Native apps for iOS and Android.",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Data encryption, role-based access, and complete audit trails.",
    },
    {
      icon: Globe,
      title: "Multi-Tenant",
      description: "Complete data isolation. Each school has its own secure environment.",
    },
    {
      icon: Zap,
      title: "Low Data Usage",
      description: "Optimized for 2G/3G networks. Minimal bandwidth consumption.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Dedicated support team for African timezone. Local language support.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Everything You Need
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Features for <span className="text-gradient">Modern Schools</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From student management to financial tracking, EduFlow provides all the tools you need to run your school efficiently.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {mainFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-card-hover transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Highlights Section */}
        <div className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl p-8 md:p-12 border border-border">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Built for African Schools
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed with the unique challenges and needs of schools in Ghana, Nigeria, Kenya, and across Africa in mind.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <div 
                key={highlight.title} 
                className="flex gap-4 p-4 bg-card/50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <highlight.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{highlight.title}</h4>
                  <p className="text-sm text-muted-foreground">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
