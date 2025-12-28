import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join hundreds of Ghanaian schools already using EduSupport. 
            Start and enjoy a seamless educational experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="heroGold" asChild>
              <Link to="/signup">
                Start Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="xl" 
              className="bg-primary-foreground/10 text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/20"
              asChild
            >
              <Link to="#contact">
                <Phone className="h-5 w-5" />
                Schedule a Demo
              </Link>
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/60 mt-6">
            No credit card required • Free training included • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
