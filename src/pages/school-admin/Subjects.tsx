import { useState } from "react";
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DEFAULT_SUBJECTS } from "@/lib/constants/ghana-education";

const subjects = [
  { id: "1", code: "ENG", name: "English Language", classes: ["Basic 6A", "Basic 6B", "Basic 5A", "Basic 5B", "Basic 4A", "Basic 4B"], teachers: 3 },
  { id: "2", code: "MTH", name: "Mathematics", classes: ["Basic 6A", "Basic 6B", "Basic 5A", "Basic 5B", "Basic 4A", "Basic 4B"], teachers: 2 },
  { id: "3", code: "SCI", name: "Integrated Science", classes: ["Basic 6A", "Basic 6B", "Basic 5A", "Basic 5B"], teachers: 2 },
  { id: "4", code: "SOC", name: "Social Studies", classes: ["Basic 6A", "Basic 6B", "Basic 5A", "Basic 5B"], teachers: 2 },
  { id: "5", code: "RME", name: "Religious and Moral Education", classes: ["Basic 6A", "Basic 6B", "Basic 5A"], teachers: 1 },
  { id: "6", code: "ICT", name: "Information and Communication Technology", classes: ["Basic 6A", "Basic 6B", "Basic 5A", "Basic 5B"], teachers: 1 },
  { id: "7", code: "CRA", name: "Creative Arts", classes: ["Basic 5A", "Basic 5B", "Basic 4A", "Basic 4B"], teachers: 1 },
  { id: "8", code: "TWI", name: "Ghanaian Language (Twi)", classes: ["Basic 4A", "Basic 4B", "Basic 3A", "Basic 3B"], teachers: 1 },
  { id: "9", code: "FRE", name: "French", classes: ["Basic 5A", "Basic 5B", "Basic 4A"], teachers: 1 },
  { id: "10", code: "PHE", name: "Physical Education", classes: ["Basic 6A", "Basic 6B", "Basic 5A", "Basic 5B", "Basic 4A", "Basic 4B"], teachers: 1 },
];

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredSubjects = subjects.filter((subject) => {
    return subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout role="school-admin" schoolName="Bright Future Basic School">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Subjects</h1>
          <p className="text-muted-foreground">Manage subjects and curriculum.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Add a new subject to the curriculum.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject-code">Subject Code</Label>
                <Input id="subject-code" placeholder="e.g., MTH" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input id="subject-name" placeholder="e.g., Mathematics" />
              </div>
              <div className="space-y-2">
                <Label>Quick Add from GES Curriculum</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DEFAULT_SUBJECTS.slice(0, 5).map((s) => (
                    <Badge key={s.code} variant="outline" className="cursor-pointer hover:bg-primary/10">
                      {s.code}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-card p-4 rounded-2xl border border-border mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Code</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Subject Name</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Classes</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Teachers</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {subject.code}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{subject.name}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {subject.classes.slice(0, 3).map((cls) => (
                        <Badge key={cls} variant="secondary" className="text-xs">
                          {cls}
                        </Badge>
                      ))}
                      {subject.classes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{subject.classes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{subject.teachers}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </p>
        </div>
      </div>

      {/* GES Curriculum Info */}
      <div className="mt-6 p-4 bg-info/10 rounded-xl border border-info/20">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-info mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Ghana Education Service Curriculum</p>
            <p className="text-sm text-muted-foreground mt-1">
              Subjects are aligned with the GES Basic Education curriculum. Core subjects include English, Mathematics, 
              Integrated Science, Social Studies, and RME.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
