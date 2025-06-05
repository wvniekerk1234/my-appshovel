"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Plus, Trash2, Users, Printer } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  code: string
  name: string
}

interface TeamMember {
  id: string
  name: string
}

interface TimeEntry {
  id: string
  projectId: string
  teamMemberId: string
  date: string
  hours: number
  kilometers: number
  description?: string
}

export default function ShovelProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [reportStartDate, setReportStartDate] = useState<Date>()
  const [reportEndDate, setReportEndDate] = useState<Date>()
  const [reportTeamMemberFilter, setReportTeamMemberFilter] = useState<string>("all")

  // Project form state
  const [newProjectCode, setNewProjectCode] = useState("")
  const [newProjectName, setNewProjectName] = useState("")

  // Team member form state
  const [newTeamMemberName, setNewTeamMemberName] = useState("")

  // Time entry form state
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState("")
  const [hours, setHours] = useState("")
  const [kilometers, setKilometers] = useState("")
  const [description, setDescription] = useState("")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("shovel-projects")
    const savedTeamMembers = localStorage.getItem("shovel-team-members")
    const savedEntries = localStorage.getItem("shovel-time-entries")

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
    }
    if (savedEntries) {
      setTimeEntries(JSON.parse(savedEntries))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("shovel-projects", JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem("shovel-team-members", JSON.stringify(teamMembers))
  }, [teamMembers])

  useEffect(() => {
    localStorage.setItem("shovel-time-entries", JSON.stringify(timeEntries))
  }, [timeEntries])

  const addProject = () => {
    if (newProjectCode && newProjectName) {
      const newProject: Project = {
        id: Date.now().toString(),
        code: newProjectCode,
        name: newProjectName,
      }
      setProjects([...projects, newProject])
      setNewProjectCode("")
      setNewProjectName("")
    }
  }

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id))
    setTimeEntries(timeEntries.filter((e) => e.projectId !== id))
  }

  const addTeamMember = () => {
    if (newTeamMemberName.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newTeamMemberName.trim(),
      }
      setTeamMembers([...teamMembers, newMember])
      setNewTeamMemberName("")
    }
  }

  const deleteTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id))
    setTimeEntries(timeEntries.filter((e) => e.teamMemberId !== id))
  }

  const addTimeEntry = () => {
    if (selectedProjectId && selectedTeamMemberId && (hours || kilometers)) {
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        projectId: selectedProjectId,
        teamMemberId: selectedTeamMemberId,
        date: format(selectedDate, "yyyy-MM-dd"),
        hours: Number.parseFloat(hours) || 0,
        kilometers: Number.parseFloat(kilometers) || 0,
        description,
      }
      setTimeEntries([...timeEntries, newEntry])
      setSelectedProjectId("")
      setSelectedTeamMemberId("")
      setHours("")
      setKilometers("")
      setDescription("")
    }
  }

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter((e) => e.id !== id))
  }

  const getFilteredEntries = () => {
    let filtered = timeEntries

    // Filter by date range
    if (reportStartDate && reportEndDate) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date)

        // Create normalized dates (set to midnight) for proper comparison
        const normalizedEntryDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
        const normalizedStartDate = new Date(
          reportStartDate.getFullYear(),
          reportStartDate.getMonth(),
          reportStartDate.getDate(),
        )
        const normalizedEndDate = new Date(
          reportEndDate.getFullYear(),
          reportEndDate.getMonth(),
          reportEndDate.getDate(),
        )

        // Include entries from start date through end date (inclusive)
        return normalizedEntryDate >= normalizedStartDate && normalizedEntryDate <= normalizedEndDate
      })
    }

    // Filter by team member
    if (reportTeamMemberFilter !== "all") {
      filtered = filtered.filter((entry) => entry.teamMemberId === reportTeamMemberFilter)
    }

    return filtered
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project ? `${project.code} - ${project.name}` : "Unknown Project"
  }

  const getTeamMemberName = (teamMemberId: string) => {
    const member = teamMembers.find((m) => m.id === teamMemberId)
    return member ? member.name : "Unknown Member"
  }

  const calculateTotals = (entries: TimeEntry[]) => {
    return entries.reduce(
      (totals, entry) => ({
        hours: totals.hours + entry.hours,
        kilometers: totals.kilometers + entry.kilometers,
      }),
      { hours: 0, kilometers: 0 },
    )
  }

  const printReport = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shovel Project Time Tracker - Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .filters { margin-bottom: 20px; padding: 15px; background: #f5f5f5; }
          .totals { display: flex; gap: 20px; margin-bottom: 20px; }
          .total-card { flex: 1; padding: 15px; border: 1px solid #ddd; text-align: center; }
          .total-value { font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .no-data { text-align: center; padding: 20px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Shovel Project Time Tracker</h1>
          <h2>Time & Travel Report</h2>
          <p>Generated on ${format(new Date(), "PPP 'at' p")}</p>
        </div>
        
        <div class="filters">
          <strong>Report Filters:</strong><br>
          ${
            reportStartDate && reportEndDate
              ? `Date Range: ${format(reportStartDate, "MMM dd, yyyy")} - ${format(reportEndDate, "MMM dd, yyyy")}`
              : "Date Range: All dates"
          }<br>
          Team Member: ${
            reportTeamMemberFilter === "all" ? "All Team Members" : getTeamMemberName(reportTeamMemberFilter)
          }
        </div>
  
        <div class="totals">
          <div class="total-card">
            <div>Total Hours</div>
            <div class="total-value">${totals.hours.toFixed(1)}h</div>
          </div>
          <div class="total-card">
            <div>Total Travel</div>
            <div class="total-value">${totals.kilometers.toFixed(1)}km</div>
          </div>
        </div>
  
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Team Member</th>
              <th>Project</th>
              <th>Hours</th>
              <th>Travel (km)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredEntries.length === 0
                ? '<tr><td colspan="6" class="no-data">No entries found for the selected criteria</td></tr>'
                : filteredEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(
                      (entry) => `
                    <tr>
                      <td>${format(new Date(entry.date), "MMM dd, yyyy")}</td>
                      <td>${getTeamMemberName(entry.teamMemberId)}</td>
                      <td>${getProjectName(entry.projectId)}</td>
                      <td>${entry.hours.toFixed(1)}h</td>
                      <td>${entry.kilometers.toFixed(1)}km</td>
                      <td>${entry.description || "-"}</td>
                    </tr>
                  `,
                    )
                    .join("")
            }
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(reportHtml)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const filteredEntries = getFilteredEntries()
  const totals = calculateTotals(filteredEntries)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Users className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold">Shovel Project Time Tracker</h1>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="entry">Time Entry</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="data">View Data</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Add and manage team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTeamMemberName}
                    onChange={(e) => setNewTeamMemberName(e.target.value)}
                    placeholder="Enter team member name"
                    onKeyPress={(e) => e.key === "Enter" && addTeamMember()}
                  />
                  <Button onClick={addTeamMember}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {teamMembers.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No team members added yet.</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{member.name}</span>
                        <Button variant="outline" size="sm" onClick={() => deleteTeamMember(member.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Add and manage projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={newProjectCode}
                    onChange={(e) => setNewProjectCode(e.target.value)}
                    placeholder="Project Code (e.g., PRJ001)"
                  />
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project Name"
                    onKeyPress={(e) => e.key === "Enter" && addProject()}
                  />
                  <Button onClick={addProject} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>

                <div className="space-y-2">
                  {projects.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No projects added yet.</p>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">
                          <div className="font-medium">{project.code}</div>
                          <div className="text-muted-foreground">{project.name}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => deleteProject(project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>Daily Time Entry</CardTitle>
              <CardDescription>Record time spent and travel for projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Team Member</Label>
                  <Select value={selectedTeamMemberId} onValueChange={setSelectedTeamMemberId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Project</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.code} - {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hours">Hours Worked</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="kilometers">Travel (km)</Label>
                  <Input
                    id="kilometers"
                    type="number"
                    step="0.1"
                    value={kilometers}
                    onChange={(e) => setKilometers(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of work done"
                />
              </div>

              <Button onClick={addTimeEntry} className="w-full" disabled={!selectedTeamMemberId || !selectedProjectId}>
                Add Entry
              </Button>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Today's Entries</h3>
                {timeEntries
                  .filter((entry) => entry.date === format(selectedDate, "yyyy-MM-dd"))
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{getTeamMemberName(entry.teamMemberId)}</div>
                        <div className="text-sm text-muted-foreground">{getProjectName(entry.projectId)}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.hours > 0 && `${entry.hours}h`}
                          {entry.hours > 0 && entry.kilometers > 0 && " • "}
                          {entry.kilometers > 0 && `${entry.kilometers}km`}
                          {entry.description && ` • ${entry.description}`}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => deleteTimeEntry(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Time & Travel Reports</CardTitle>
              <CardDescription>Generate reports based on date ranges and team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reportStartDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reportStartDate ? format(reportStartDate, "PPP") : <span>Pick start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={reportStartDate} onSelect={setReportStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reportEndDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reportEndDate ? format(reportEndDate, "PPP") : <span>Pick end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={reportEndDate} onSelect={setReportEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Team Member</Label>
                  <Select value={reportTeamMemberFilter} onValueChange={setReportTeamMemberFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={printReport} variant="outline" className="w-full md:w-auto">
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.hours.toFixed(1)}h</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Travel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.kilometers.toFixed(1)}km</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Detailed Report</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Team Member</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Travel (km)</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No entries found for the selected criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEntries
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{format(new Date(entry.date), "MMM dd, yyyy")}</TableCell>
                              <TableCell>{getTeamMemberName(entry.teamMemberId)}</TableCell>
                              <TableCell>{getProjectName(entry.projectId)}</TableCell>
                              <TableCell>{entry.hours.toFixed(1)}h</TableCell>
                              <TableCell>{entry.kilometers.toFixed(1)}km</TableCell>
                              <TableCell>{entry.description || "-"}</TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members ({teamMembers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-muted-foreground">No team members added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="p-2 border rounded">
                        {member.name}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projects ({projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-muted-foreground">No projects added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div key={project.id} className="p-2 border rounded">
                        <div className="font-medium">{project.code}</div>
                        <div className="text-sm text-muted-foreground">{project.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Time Entries ({timeEntries.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {timeEntries.length === 0 ? (
                <p className="text-muted-foreground">No time entries recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {timeEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((entry) => (
                      <div key={entry.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{getTeamMemberName(entry.teamMemberId)}</div>
                            <div className="text-sm text-muted-foreground">{getProjectName(entry.projectId)}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(entry.date), "MMM dd, yyyy")} • {entry.hours > 0 && `${entry.hours}h`}
                              {entry.hours > 0 && entry.kilometers > 0 && " • "}
                              {entry.kilometers > 0 && `${entry.kilometers}km`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
