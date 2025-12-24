import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketStats } from "@/components/ticket-stats"
import { TicketsList } from "@/components/tickets-list"
import { AdminAttendanceOverview } from "@/components/admin-attendance-overview"
import { LeaveRequestsAdmin } from "@/components/leave-requests-admin"
import { Button } from "@/components/ui/button"
import { LogOut, Building2 } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: employee } = await supabase.from("employees").select("*").eq("id", user.id).single()

  if (!employee || employee.role !== "admin") {
    redirect("/dashboard")
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
                <h1 className="text-xl font-semibold text-slate-900">PACS Admin Portal</h1>
                <p className="text-sm text-slate-600">
                  {employee.first_name} {employee.last_name} - Administrator
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
        <div className="space-y-8">
          {/* Ticket Statistics */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Ticket Overview</h2>
            <TicketStats isAdmin />
          </section>

          {/* Attendance Overview */}
          <section>
            <AdminAttendanceOverview />
          </section>

          {/* Leave Requests */}
          <section>
            <LeaveRequestsAdmin />
          </section>

          {/* All Tickets */}
          <section>
            <TicketsList userId={user.id} isAdmin />
          </section>
        </div>
      </main>
    </div>
  )
}
