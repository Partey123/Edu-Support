import { Quote, Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "EduFlow transformed how we manage our school. Fee collection that used to take weeks now happens in real-time with mobile money integration.",
      author: "Mrs. Abena Owusu",
      role: "Principal",
      school: "Bright Future Academy, Ghana",
      image: "AO",
      rating: 5,
    },
    {
      quote: "The offline functionality is a game-changer. Our teachers can mark attendance even without internet, and it syncs automatically later.",
      author: "Mr. Chinedu Okonkwo",
      role: "School Administrator",
      school: "Excellence Secondary School, Nigeria",
      image: "CO",
      rating: 5,
    },
    {
      quote: "Parent communication has never been easier. The WhatsApp integration means parents get instant updates about their children.",
      author: "Ms. Wanjiku Kamau",
      role: "Head Teacher",
      school: "Sunrise Primary School, Kenya",
      image: "WK",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Trusted by Schools Across Africa
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our{" "}
            <span className="text-gradient">Schools Say</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of schools that have transformed their operations with EduFlow.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="relative p-6 md:p-8 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-card transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 bg-card rounded-2xl border border-border">
          {[
            { value: "500+", label: "Schools" },
            { value: "50,000+", label: "Students" },
            { value: "5,000+", label: "Teachers" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
