import { QrCode, Camera, Upload, History, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";

const recentScans = [
  { id: 1, type: "Student ID", name: "Sarah Mensah", time: "2 minutes ago", status: "success" },
  { id: 2, type: "Library Book", name: "Mathematics Vol. 3", time: "15 minutes ago", status: "success" },
  { id: 3, type: "Student ID", name: "Kwame Asante", time: "1 hour ago", status: "failed" },
  { id: 4, type: "Event Ticket", name: "Science Fair 2024", time: "2 hours ago", status: "success" },
  { id: 5, type: "Student ID", name: "Ama Darko", time: "3 hours ago", status: "pending" },
];

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "pending":
        return <Clock className="w-5 h-5 text-accent" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: "bg-primary/10 text-primary",
      failed: "bg-destructive/10 text-destructive",
      pending: "bg-accent/10 text-accent",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">QR Scanner</h1>
          <p className="text-sm text-muted-foreground">Scan student IDs, library books, and event tickets</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "scan" ? "default" : "outline"}
          onClick={() => setActiveTab("scan")}
          className={cn(activeTab !== "scan" && "glass-button")}
        >
          <Camera className="w-4 h-4 mr-2" />
          Scan
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          onClick={() => setActiveTab("history")}
          className={cn(activeTab !== "history" && "glass-button")}
        >
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </div>

      {activeTab === "scan" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scanner Area */}
          <div className="glass-card rounded-xl p-6">
            <div className="aspect-square max-w-md mx-auto rounded-xl bg-secondary/50 border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden">
              {isScanning ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse" style={{ animation: "scanLine 2s ease-in-out infinite" }} />
                  <QrCode className="w-16 h-16 sm:w-24 sm:h-24 text-primary animate-pulse" />
                  <p className="mt-4 text-sm text-muted-foreground">Scanning...</p>
                  <p className="text-xs text-muted-foreground mt-1">Position QR code within the frame</p>
                </>
              ) : (
                <>
                  <QrCode className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">Camera preview will appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Start Scanning" to begin</p>
                </>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                className="flex-1"
                onClick={() => setIsScanning(!isScanning)}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isScanning ? "Stop Scanning" : "Start Scanning"}
              </Button>
              <Button variant="outline" className="flex-1 glass-button">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col glass-button">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm">Student Check-in</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col glass-button">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                    <QrCode className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm">Library Scan</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col glass-button">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-2">
                    <QrCode className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <span className="text-sm">Event Ticket</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col glass-button">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <QrCode className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm">Asset Tracking</span>
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Scans</h3>
              <div className="space-y-3">
                {recentScans.slice(0, 3).map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(scan.status)}
                      <div>
                        <p className="text-sm font-medium text-foreground">{scan.name}</p>
                        <p className="text-xs text-muted-foreground">{scan.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{scan.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", getStatusBadge(scan.status))}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground">{scan.name}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{scan.type}</td>
                    <td className="p-4 text-sm text-muted-foreground">{scan.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default QRScanner;
