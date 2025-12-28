import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Mrs. Akosua Mensah",
    role: "Headmistress",
    school: "Bright Future Basic School, Accra",
    content: "EduSupport has transformed how we manage our school. The attendance tracking alone has saved us hours every week. Our parents love the real-time updates!",
    rating: 5,
  },
  {
    name: "Mr. Kwame Asante",
    role: "School Administrator",
    school: "Victory Academy, Kumasi",
    content: "The grading system is perfectly aligned with Ghana's curriculum. Report card generation that used to take days now takes minutes. Highly recommended!",
    rating: 5,
  },
  {
    name: "Mrs. Ama Owusu",
    role: "Teacher",
    school: "Grace International School, Takoradi",
    content: "As a teacher, I can focus more on teaching and less on paperwork. Marking attendance and entering grades is so simple. The parent communication feature is excellent.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by Schools Across Ghana
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from educators who have transformed their schools with EduSupport.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="p-8 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary">{testimonial.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
