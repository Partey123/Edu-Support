import { CreditCard, TrendingUp, TrendingDown, Download, Plus, Search, Filter, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { GlassDialog, FormField, FormInput, FormSelect, FormActions } from "@/components/ui/glass-dialog";
import { useToast } from "@/hooks/use-toast";

const transactions = [
  { id: "TXN001", student: "Kwame Asante", studentId: "STU001", type: "Fees", amount: "GHS 500", status: "Completed", date: "Dec 9, 2025", method: "Mobile Money" },
  { id: "TXN002", student: "Akua Mensah", studentId: "STU002", type: "Fees", amount: "GHS 450", status: "Completed", date: "Dec 9, 2025", method: "Bank Transfer" },
  { id: "TXN003", student: "Kofi Owusu", studentId: "STU003", type: "Books", amount: "GHS 120", status: "Pending", date: "Dec 8, 2025", method: "Cash" },
  { id: "TXN004", student: "Ama Serwaa", studentId: "STU004", type: "Fees", amount: "GHS 500", status: "Completed", date: "Dec 8, 2025", method: "Mobile Money" },
  { id: "TXN005", student: "Yaw Boateng", studentId: "STU005", type: "Transport", amount: "GHS 200", status: "Failed", date: "Dec 7, 2025", method: "Mobile Money" },
];

const Finance = () => {
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isViewTransactionOpen, setIsViewTransactionOpen] = useState(false);
  const [isGenerateInvoiceOpen, setIsGenerateInvoiceOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null);
  const { toast } = useToast();

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Payment Recorded",
      description: "The payment has been successfully recorded.",
    });
    setIsRecordPaymentOpen(false);
  };

  const handleViewTransaction = (transaction: typeof transactions[0]) => {
    setSelectedTransaction(transaction);
    setIsViewTransactionOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance</h1>
          <p className="text-muted-foreground">Track payments and manage school finances</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" onClick={() => setIsGenerateInvoiceOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Invoice
          </Button>
          <Button variant="glass">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="hero" onClick={() => setIsRecordPaymentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Collected</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-success">GHS 125,450</p>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Outstanding</span>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive">GHS 35,200</p>
          <p className="text-xs text-muted-foreground">45 students pending</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">This Month</span>
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">GHS 28,500</p>
          <p className="text-xs text-muted-foreground">156 transactions</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Collection Rate</span>
            <div className="w-4 h-4 rounded-full gradient-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">78%</p>
          <p className="text-xs text-muted-foreground">Target: 90%</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full h-10 pl-10 pr-4 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="glass">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Student</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{txn.id}</td>
                  <td className="p-4 text-sm text-foreground hidden sm:table-cell">{txn.student}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{txn.type}</td>
                  <td className="p-4 text-sm font-semibold text-foreground">{txn.amount}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      txn.status === "Completed" 
                        ? "bg-success/10 text-success" 
                        : txn.status === "Pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{txn.date}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(txn)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Dialog */}
      <GlassDialog
        open={isRecordPaymentOpen}
        onOpenChange={setIsRecordPaymentOpen}
        title="Record Payment"
        description="Enter payment details to record a new transaction"
        size="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <FormField label="Student" required>
            <FormSelect required>
              <option value="">Select student</option>
              <option value="STU001">Kwame Asante (STU001)</option>
              <option value="STU002">Akua Mensah (STU002)</option>
              <option value="STU003">Kofi Owusu (STU003)</option>
              <option value="STU004">Ama Serwaa (STU004)</option>
              <option value="STU005">Yaw Boateng (STU005)</option>
            </FormSelect>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Payment Type" required>
              <FormSelect required>
                <option value="">Select type</option>
                <option value="fees">School Fees</option>
                <option value="books">Books</option>
                <option value="transport">Transport</option>
                <option value="uniform">Uniform</option>
                <option value="other">Other</option>
              </FormSelect>
            </FormField>
            <FormField label="Amount (GHS)" required>
              <FormInput type="number" placeholder="0.00" required min="0" step="0.01" />
            </FormField>
          </div>
          <FormField label="Payment Method" required>
            <FormSelect required>
              <option value="">Select method</option>
              <option value="cash">Cash</option>
              <option value="mobile-money">Mobile Money</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="card">Card Payment</option>
            </FormSelect>
          </FormField>
          <FormField label="Reference Number">
            <FormInput placeholder="e.g., Mobile Money reference" />
          </FormField>
          <FormField label="Notes">
            <FormInput placeholder="Any additional notes" />
          </FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsRecordPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Record Payment
            </Button>
          </FormActions>
        </form>
      </GlassDialog>

      {/* View Transaction Dialog */}
      <GlassDialog
        open={isViewTransactionOpen}
        onOpenChange={setIsViewTransactionOpen}
        title="Transaction Details"
        size="md"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="font-semibold text-foreground">{selectedTransaction.id}</p>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                selectedTransaction.status === "Completed" 
                  ? "bg-success/10 text-success" 
                  : selectedTransaction.status === "Pending"
                  ? "bg-warning/10 text-warning"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {selectedTransaction.status}
              </span>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold text-foreground">{selectedTransaction.amount}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium text-foreground">{selectedTransaction.student}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Student ID</span>
                <span className="font-medium text-foreground">{selectedTransaction.studentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Payment Type</span>
                <span className="font-medium text-foreground">{selectedTransaction.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground">{selectedTransaction.method}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{selectedTransaction.date}</span>
              </div>
            </div>
            <FormActions>
              <Button variant="ghost" onClick={() => setIsViewTransactionOpen(false)}>
                Close
              </Button>
              <Button variant="glass">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </FormActions>
          </div>
        )}
      </GlassDialog>

      {/* Generate Invoice Dialog */}
      <GlassDialog
        open={isGenerateInvoiceOpen}
        onOpenChange={setIsGenerateInvoiceOpen}
        title="Generate Invoice"
        description="Create an invoice for a student"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); toast({ title: "Invoice Generated" }); setIsGenerateInvoiceOpen(false); }} className="space-y-4">
          <FormField label="Student" required>
            <FormSelect required>
              <option value="">Select student</option>
              <option value="STU001">Kwame Asante (STU001)</option>
              <option value="STU002">Akua Mensah (STU002)</option>
              <option value="STU003">Kofi Owusu (STU003)</option>
            </FormSelect>
          </FormField>
          <FormField label="Invoice Type" required>
            <FormSelect required>
              <option value="">Select type</option>
              <option value="term-fees">Term Fees</option>
              <option value="transport">Transport Fees</option>
              <option value="books">Book Fees</option>
              <option value="custom">Custom Invoice</option>
            </FormSelect>
          </FormField>
          <FormField label="Due Date" required>
            <FormInput type="date" required />
          </FormField>
          <FormField label="Notes">
            <FormInput placeholder="Any additional notes for the invoice" />
          </FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsGenerateInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </FormActions>
        </form>
      </GlassDialog>
    </DashboardLayout>
  );
};

export default Finance;