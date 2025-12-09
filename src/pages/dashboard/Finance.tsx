import { CreditCard, TrendingUp, TrendingDown, Download, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const transactions = [
  { id: "TXN001", student: "Kwame Asante", type: "Fees", amount: "GHS 500", status: "Completed", date: "Dec 9, 2025" },
  { id: "TXN002", student: "Akua Mensah", type: "Fees", amount: "GHS 450", status: "Completed", date: "Dec 9, 2025" },
  { id: "TXN003", student: "Kofi Owusu", type: "Books", amount: "GHS 120", status: "Pending", date: "Dec 8, 2025" },
  { id: "TXN004", student: "Ama Serwaa", type: "Fees", amount: "GHS 500", status: "Completed", date: "Dec 8, 2025" },
  { id: "TXN005", student: "Yaw Boateng", type: "Transport", amount: "GHS 200", status: "Failed", date: "Dec 7, 2025" },
];

const Finance = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance</h1>
          <p className="text-muted-foreground">Track payments and manage school finances</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-button">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">GHS 125,450</p>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Outstanding</span>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive">GHS 35,200</p>
          <p className="text-xs text-muted-foreground">45 students pending</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">This Month</span>
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">GHS 28,500</p>
          <p className="text-xs text-muted-foreground">156 transactions</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Collection Rate</span>
            <div className="w-4 h-4 rounded-full bg-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">78%</p>
          <p className="text-xs text-muted-foreground">Target: 90%</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" className="glass-button">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{txn.id}</td>
                  <td className="p-4 text-sm text-foreground">{txn.student}</td>
                  <td className="p-4 text-sm text-muted-foreground">{txn.type}</td>
                  <td className="p-4 text-sm font-semibold text-foreground">{txn.amount}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      txn.status === "Completed" 
                        ? "bg-emerald-100 text-emerald-600" 
                        : txn.status === "Pending"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
