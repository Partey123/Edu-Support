import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  CreditCard, 
  Calendar,
  Library,
  Bus,
  Building2,
  MessageSquare,
  BarChart3,
  ClipboardCheck,
  UserCheck,
  FileText,
  Heart,
  Laptop,
  Settings
} from "lucide-react";

const Modules = () => {
  const modules = [
    { icon: GraduationCap, name: "Student Management", description: "Complete student lifecycle" },
    { icon: Users, name: "Staff Management", description: "HR and attendance" },
    { icon: BookOpen, name: "Academics", description: "Curriculum & syllabus" },
    { icon: ClipboardCheck, name: "Examinations", description: "Results & report cards" },
    { icon: CreditCard, name: "Finance", description: "Fees & accounting" },
    { icon: Calendar, name: "Timetable", description: "Smart scheduling" },
    { icon: UserCheck, name: "Attendance", description: "Biometric & RFID" },
    { icon: Library, name: "Library", description: "Book management" },
    { icon: Bus, name: "Transport", description: "GPS tracking" },
    { icon: Building2, name: "Hostel", description: "Boarding management" },
    { icon: MessageSquare, name: "Communication", description: "SMS, WhatsApp, Email" },
    { icon: BarChart3, name: "Reports", description: "Analytics & insights" },
    { icon: FileText, name: "Admissions", description: "Online enrollment" },
    { icon: Heart, name: "Health Records", description: "Medical tracking" },
    { icon: Laptop, name: "LMS", description: "Online learning" },
    { icon: Settings, name: "Administration", description: "Full control" },
  ];

  return (
    <section id="modules" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            20+ Integrated Modules
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            One Platform,{" "}
            <span className="text-gradient">Endless Possibilities</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every module works seamlessly together. Enable only what you need, add more as you grow.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {modules.map((module, index) => (
            <div
              key={module.name}
              className="group p-4 md:p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all">
                <module.icon className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">{module.name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{module.description}</p>
            </div>
          ))}
        </div>

        {/* Integration Banner */}
        <div className="mt-12 p-6 md:p-8 bg-card rounded-2xl border border-border text-center">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            Seamless Integrations
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Connect with your favorite tools: Payment gateways, SMS providers, video conferencing, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {["Paystack", "Flutterwave", "MTN MoMo", "Zoom", "Google Meet", "WhatsApp"].map((integration) => (
              <div
                key={integration}
                className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-muted-foreground"
              >
                {integration}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Modules;
