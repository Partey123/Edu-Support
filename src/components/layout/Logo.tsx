import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  linkTo?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ size = "md", showText = true, linkTo = "/" }: LogoProps) {
  const content = (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-primary flex items-center justify-center shadow-md`}>
        <GraduationCap className="h-[60%] w-[60%] text-primary-foreground" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-foreground leading-tight`}>
            Edu<span className="text-primary">Support</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
            Ghana Schools
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="hover:opacity-90 transition-opacity">{content}</Link>;
  }

  return content;
}
