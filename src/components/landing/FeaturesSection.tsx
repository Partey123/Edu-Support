import { 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  BarChart3, 
  FileText, 
  CreditCard,
  Shield,
  Smartphone,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Easily manage student records, enrollments, and profiles. Import students in bulk via CSV.",
  },
  {
    icon: GraduationCap,
    title: "Teacher Management",
    description: "Track teacher assignments, schedules, and class allocations effortlessly.",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance Tracking",
    description: "Mark and monitor daily attendance. Generate attendance reports and identify patterns.",
  },
  {
    icon: BarChart3,
    title: "Grade Management",
    description: "Enter and calculate grades with Ghana's grading system. Track student performance over time.",
  },
  {
    icon: FileText,
    title: "Report Cards",
    description: "Generate professional report cards automatically. Customize templates to match your school.",
  },
  {
    icon: CreditCard,
    title: "Fee Management",
    description: "Track fee payments, send reminders, and generate financial reports for parents.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure access for admins, teachers, and parents. Each role sees only what they need.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Access from any device. Teachers can mark attendance and parents can view reports on the go.",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Parents receive instant notifications on attendance, grades, and school announcements.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Features
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything Your School Needs
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete solution designed specifically for Ghanaian basic schools. 
            Manage students, teachers, grades, and more from one powerful platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 lg:p-8 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
