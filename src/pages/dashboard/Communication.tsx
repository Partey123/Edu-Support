import { MessageSquare, Send, Users, Bell, Mail, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const messagesData = [
  { title: "Term 2 Fee Reminder", recipients: "All Parents", type: "SMS", sent: "Dec 8, 2025", status: "Delivered" },
  { title: "Parent-Teacher Meeting", recipients: "Form 3 Parents", type: "Email", sent: "Dec 7, 2025", status: "Delivered" },
  { title: "Sports Day Announcement", recipients: "All Students", type: "WhatsApp", sent: "Dec 6, 2025", status: "Delivered" },
  { title: "Holiday Schedule", recipients: "All Staff", type: "Email", sent: "Dec 5, 2025", status: "Delivered" },
  { title: "Exam Timetable", recipients: "Form 3 Students", type: "SMS", sent: "Dec 4, 2025", status: "Pending" },
];

const Communication = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communication</h1>
          <p className="text-muted-foreground">Send messages and announcements</p>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Messages Sent", value: "1,245", icon: Send, color: "text-primary" },
          { label: "SMS Credits", value: "5,000", icon: Phone, color: "text-emerald-600" },
          { label: "Email Sent", value: "890", icon: Mail, color: "text-violet-600" },
          { label: "WhatsApp", value: "355", icon: MessageSquare, color: "text-sky-600" },
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Phone, label: "Send SMS", description: "Text message to parents", color: "bg-primary/10 text-primary" },
          { icon: Mail, label: "Send Email", description: "Email to staff or parents", color: "bg-violet-100 text-violet-600" },
          { icon: MessageSquare, label: "WhatsApp", description: "Broadcast on WhatsApp", color: "bg-emerald-100 text-emerald-600" },
        ].map((action) => (
          <button key={action.label} className="glass-card rounded-xl p-5 text-left hover:shadow-card-hover transition-all group">
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Recent Messages */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Recent Messages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Message</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Recipients</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sent</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {messagesData.map((msg, index) => (
                <tr key={index} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4 font-medium text-foreground">{msg.title}</td>
                  <td className="p-4 text-sm text-muted-foreground">{msg.recipients}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      msg.type === "SMS" 
                        ? "bg-primary/10 text-primary"
                        : msg.type === "Email"
                        ? "bg-violet-100 text-violet-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}>
                      {msg.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{msg.sent}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      msg.status === "Delivered" 
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Communication;
