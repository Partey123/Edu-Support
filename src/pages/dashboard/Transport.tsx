import { Bus, MapPin, Users, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const routesData = [
  { name: "Route A - Accra Central", driver: "Mr. Kofi Ansah", vehicle: "GR-1234-20", students: 35, stops: 8, status: "Active" },
  { name: "Route B - East Legon", driver: "Mr. Yaw Mensah", vehicle: "GR-5678-20", students: 28, stops: 6, status: "Active" },
  { name: "Route C - Tema", driver: "Mr. Emmanuel Adjei", vehicle: "GR-9012-20", students: 42, stops: 10, status: "Active" },
  { name: "Route D - Madina", driver: "Mr. Kwaku Owusu", vehicle: "GR-3456-20", students: 30, stops: 7, status: "Maintenance" },
  { name: "Route E - Spintex", driver: "Mr. Samuel Asante", vehicle: "GR-7890-20", students: 25, stops: 5, status: "Active" },
];

const Transport = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transport</h1>
          <p className="text-muted-foreground">Manage school buses and routes</p>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Route
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Buses", value: "8", icon: Bus, color: "text-primary" },
          { label: "Active Routes", value: "5", icon: MapPin, color: "text-emerald-600" },
          { label: "Students Using", value: "320", icon: Users, color: "text-violet-600" },
          { label: "Avg. Trip Time", value: "45 min", icon: Clock, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Routes Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {routesData.map((route) => (
          <div key={route.name} className="glass-card rounded-xl p-5 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{route.name}</h3>
                  <p className="text-sm text-muted-foreground">{route.vehicle}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                route.status === "Active" 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-amber-100 text-amber-600"
              }`}>
                {route.status}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{route.students}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{route.stops}</p>
                <p className="text-xs text-muted-foreground">Stops</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">45</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Driver:</span>
              <span className="font-medium text-foreground">{route.driver}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Transport;
