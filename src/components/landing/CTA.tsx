import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your School?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8">
              Join 500+ schools across Africa that are already using EduFlow to streamline operations, 
              improve communication, and deliver better education.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button variant="accent" size="xl" className="shadow-lg" asChild>
                <Link to="/dashboard">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="glass" 
                size="xl"
                className="bg-white/10 text-primary-foreground border-white/20 hover:bg-white/20"
              >
                Schedule a Demo
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center text-primary-foreground/90">
              <a href="tel:+233201234567" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Phone className="w-5 h-5" />
                <span>+233 20 123 4567</span>
              </a>
              <a href="mailto:hello@eduflow.africa" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="w-5 h-5" />
                <span>hello@eduflow.africa</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
