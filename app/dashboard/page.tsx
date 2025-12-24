import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AttendanceClock } from "@/components/attendance-clock"
import { AttendanceHistory } from "@/components/attendance-history"
import { CreateTicketForm } from "@/components/create-ticket-form"
import { TicketStats } from "@/components/ticket-stats"
import { TicketsList } from "@/components/tickets-list"
import { LeaveRequestForm } from "@/components/leave-request-form"
import { LeaveRequestsHistory } from "@/components/leave-requests-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Building2 } from "lucide-react"

export default async function EmployeeDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: employee } = await supabase.from("employees").select("*").eq("id", user.id).single()

  if (!employee) {
    redirect("/login")
  }

  // If admin, redirect to admin dashboard
  if (employee.role === "admin") {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">PACS Employee Portal</h1>
                <p className="text-sm text-slate-600">
                  {employee.first_name} {employee.last_name} - {employee.department}
                </p>
              </div>
            </div>
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect("/login")
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AttendanceClock userId={user.id} />
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h3 className="mb-2 font-semibold text-slate-900">Quick Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Employee ID:</span>
                      <span className="font-medium">{employee.employee_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Position:</span>
                      <span className="font-medium">{employee.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Department:</span>
                      <span className="font-medium">{employee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="font-medium">{employee.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <AttendanceHistory userId={user.id} />
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <TicketStats userId={user.id} />
            <div className="grid gap-6 lg:grid-cols-2">
              <CreateTicketForm userId={user.id} />
              <div className="space-y-6">
                <TicketsList userId={user.id} />
              </div>
            </div>
          </TabsContent>

          {/* Leave Tab */}
          <TabsContent value="leave" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <LeaveRequestForm userId={user.id} />
              <LeaveRequestsHistory userId={user.id} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
