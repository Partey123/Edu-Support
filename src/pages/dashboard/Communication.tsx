import { MessageSquare, Send, Users, Mail, Phone, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { GlassDialog, FormField, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/glass-dialog";
import { useToast } from "@/hooks/use-toast";

const messagesData = [
  { title: "Term 2 Fee Reminder", recipients: "All Parents", type: "SMS", sent: "Dec 8, 2025", status: "Delivered" },
  { title: "Parent-Teacher Meeting", recipients: "Form 3 Parents", type: "Email", sent: "Dec 7, 2025", status: "Delivered" },
  { title: "Sports Day Announcement", recipients: "All Students", type: "WhatsApp", sent: "Dec 6, 2025", status: "Delivered" },
  { title: "Holiday Schedule", recipients: "All Staff", type: "Email", sent: "Dec 5, 2025", status: "Delivered" },
  { title: "Exam Timetable", recipients: "Form 3 Students", type: "SMS", sent: "Dec 4, 2025", status: "Pending" },
];

const Communication = () => {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = (type: string) => {
    toast({
      title: "Message Sent",
      description: `Your ${type} has been sent successfully.`,
    });
    setIsSmsDialogOpen(false);
    setIsEmailDialogOpen(false);
    setIsWhatsappDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communication</h1>
          <p className="text-muted-foreground">Send messages and announcements</p>
        </div>
        <Button variant="hero" onClick={() => setIsNewMessageOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Messages Sent", value: "1,245", icon: Send, color: "text-primary" },
          { label: "SMS Credits", value: "5,000", icon: Phone, color: "text-success" },
          { label: "Email Sent", value: "890", icon: Mail, color: "text-info" },
          { label: "WhatsApp", value: "355", icon: MessageSquare, color: "text-success" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
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
        <button 
          onClick={() => setIsSmsDialogOpen(true)}
          className="glass-card rounded-2xl p-5 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Send SMS</h3>
          <p className="text-sm text-muted-foreground">Text message to parents</p>
        </button>
        <button 
          onClick={() => setIsEmailDialogOpen(true)}
          className="glass-card rounded-2xl p-5 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Send Email</h3>
          <p className="text-sm text-muted-foreground">Email to staff or parents</p>
        </button>
        <button 
          onClick={() => setIsWhatsappDialogOpen(true)}
          className="glass-card rounded-2xl p-5 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
          <p className="text-sm text-muted-foreground">Broadcast on WhatsApp</p>
        </button>
      </div>

      {/* Recent Messages */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Recent Messages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Message</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Recipients</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Sent</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {messagesData.map((msg, index) => (
                <tr key={index} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4 font-medium text-foreground">{msg.title}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{msg.recipients}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      msg.type === "SMS" 
                        ? "bg-primary/10 text-primary"
                        : msg.type === "Email"
                        ? "bg-info/10 text-info"
                        : "bg-success/10 text-success"
                    }`}>
                      {msg.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{msg.sent}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      msg.status === "Delivered" 
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
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

      {/* New Message Dialog */}
      <GlassDialog
        open={isNewMessageOpen}
        onOpenChange={setIsNewMessageOpen}
        title="New Message"
        description="Choose how you want to send your message"
        size="md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => { setIsNewMessageOpen(false); setIsSmsDialogOpen(true); }}
            className="p-6 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground">SMS</h4>
            <p className="text-xs text-muted-foreground mt-1">5,000 credits left</p>
          </button>
          <button 
            onClick={() => { setIsNewMessageOpen(false); setIsEmailDialogOpen(true); }}
            className="p-6 rounded-xl border border-border/50 hover:border-info/50 hover:bg-info/5 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground">Email</h4>
            <p className="text-xs text-muted-foreground mt-1">Unlimited</p>
          </button>
          <button 
            onClick={() => { setIsNewMessageOpen(false); setIsWhatsappDialogOpen(true); }}
            className="p-6 rounded-xl border border-border/50 hover:border-success/50 hover:bg-success/5 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground">WhatsApp</h4>
            <p className="text-xs text-muted-foreground mt-1">Connected</p>
          </button>
        </div>
      </GlassDialog>

      {/* SMS Dialog */}
      <GlassDialog
        open={isSmsDialogOpen}
        onOpenChange={setIsSmsDialogOpen}
        title="Send SMS"
        description="Compose and send SMS to parents or staff"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage("SMS"); }} className="space-y-4">
          <FormField label="Recipients" required>
            <FormSelect required>
              <option value="">Select recipients</option>
              <option value="all-parents">All Parents</option>
              <option value="all-students">All Students</option>
              <option value="all-staff">All Staff</option>
              <option value="form1-parents">Form 1 Parents</option>
              <option value="form2-parents">Form 2 Parents</option>
              <option value="form3-parents">Form 3 Parents</option>
            </FormSelect>
          </FormField>
          <FormField label="Message" required>
            <FormTextarea rows={4} placeholder="Type your message here..." required maxLength={160} />
            <p className="text-xs text-muted-foreground mt-1">0/160 characters</p>
          </FormField>
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated recipients:</span>
              <span className="font-medium text-foreground">1,247 contacts</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">SMS credits to use:</span>
              <span className="font-medium text-foreground">1,247 credits</span>
            </div>
          </div>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsSmsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              <Send className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
          </FormActions>
        </form>
      </GlassDialog>

      {/* Email Dialog */}
      <GlassDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        title="Send Email"
        description="Compose and send email to parents or staff"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage("Email"); }} className="space-y-4">
          <FormField label="Recipients" required>
            <FormSelect required>
              <option value="">Select recipients</option>
              <option value="all-parents">All Parents</option>
              <option value="all-students">All Students</option>
              <option value="all-staff">All Staff</option>
              <option value="form1-parents">Form 1 Parents</option>
              <option value="form2-parents">Form 2 Parents</option>
              <option value="form3-parents">Form 3 Parents</option>
            </FormSelect>
          </FormField>
          <FormField label="Subject" required>
            <FormInput placeholder="Enter email subject" required />
          </FormField>
          <FormField label="Message" required>
            <FormTextarea rows={8} placeholder="Type your message here..." required />
          </FormField>
          <FormField label="Attachments">
            <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
              <Button type="button" variant="ghost" size="sm" className="mt-2">
                Browse Files
              </Button>
            </div>
          </FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </FormActions>
        </form>
      </GlassDialog>

      {/* WhatsApp Dialog */}
      <GlassDialog
        open={isWhatsappDialogOpen}
        onOpenChange={setIsWhatsappDialogOpen}
        title="Send WhatsApp Message"
        description="Broadcast message via WhatsApp"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage("WhatsApp"); }} className="space-y-4">
          <FormField label="Broadcast Group" required>
            <FormSelect required>
              <option value="">Select group</option>
              <option value="all-parents">All Parents</option>
              <option value="form1-parents">Form 1 Parents</option>
              <option value="form2-parents">Form 2 Parents</option>
              <option value="form3-parents">Form 3 Parents</option>
              <option value="staff">Staff Group</option>
            </FormSelect>
          </FormField>
          <FormField label="Message" required>
            <FormTextarea rows={5} placeholder="Type your WhatsApp message here..." required />
          </FormField>
          <FormField label="Media (Optional)">
            <div className="border-2 border-dashed border-border/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Add image or document</p>
            </div>
          </FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsWhatsappDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send WhatsApp
            </Button>
          </FormActions>
        </form>
      </GlassDialog>
    </DashboardLayout>
  );
};

export default Communication;