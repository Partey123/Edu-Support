import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save, Building, Calendar, Bell, Users, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GHANA_REGIONS, ACADEMIC_TERMS } from "@/lib/constants/ghana-education";

export default function SchoolSettingsPage() {
  return (
    <DashboardLayout role="school-admin" schoolName="Bright Future Basic School">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your school settings and preferences.</p>
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="school">School Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic Year</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="school">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  School Information
                </CardTitle>
                <CardDescription>Update your school's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl">
                    BF
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="school-name">School Name</Label>
                    <Input id="school-name" defaultValue="Bright Future Basic School" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-motto">School Motto</Label>
                    <Input id="school-motto" defaultValue="Excellence Through Education" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+233 24 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="info@brightfuture.edu.gh" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select defaultValue="Greater Accra">
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {GHANA_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" defaultValue="Accra Metropolitan" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea id="address" defaultValue="15 Independence Avenue, Accra" />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Academic Year Settings
                </CardTitle>
                <CardDescription>Configure academic year and term dates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="academic-year">Current Academic Year</Label>
                    <Select defaultValue="2025-2026">
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024/2025</SelectItem>
                        <SelectItem value="2025-2026">2025/2026</SelectItem>
                        <SelectItem value="2026-2027">2026/2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-term">Current Term</Label>
                    <Select defaultValue="term-2">
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMIC_TERMS.map((term) => (
                          <SelectItem key={term.value} value={term.value}>
                            {term.label} ({term.months})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Term Dates</h4>
                  {ACADEMIC_TERMS.map((term, index) => (
                    <div key={term.value} className="grid sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <Label className="text-xs">{term.label}</Label>
                        <p className="text-sm text-muted-foreground">{term.months}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start Date</Label>
                        <Input type="date" defaultValue={`2025-0${index * 4 + 1}-05`} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Date</Label>
                        <Input type="date" defaultValue={`2025-0${index * 4 + 4}-15`} />
                      </div>
                    </div>
                  ))}
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Academic Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Student Attendance Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when students are marked absent</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Fee Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">Send reminders for pending fee payments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Report Card Ready</p>
                  <p className="text-sm text-muted-foreground">Notify parents when report cards are ready</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Send SMS to parents (additional charges apply)</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage school administrators and staff access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      KM
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Kofi Mensah</p>
                      <p className="text-sm text-muted-foreground">kofi.mensah@brightfuture.edu.gh</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Admin (You)</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                      AA
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Ama Asare</p>
                      <p className="text-sm text-muted-foreground">ama.asare@brightfuture.edu.gh</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Staff</span>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                <Users className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
