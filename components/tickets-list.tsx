"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface TicketsListProps {
  userId: string
  isAdmin?: boolean
}

export function TicketsList({ userId, isAdmin = false }: TicketsListProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase.from("tickets").select(`
        *,
        employee:employees!tickets_employee_id_fkey(first_name, last_name),
        assigned:employees!tickets_assigned_to_fkey(first_name, last_name)
      `)

      if (!isAdmin) {
        query = query.eq("employee_id", userId)
      }

      const { data, error: queryError } = await query.order("created_at", { ascending: false }).limit(20)

      if (queryError) {
        console.error("[v0] Fetch tickets error:", queryError)
        setError("Failed to load tickets")
        return
      }

      setTickets(data || [])
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      setError("Failed to load tickets")
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
      low: { variant: "outline", color: "text-slate-700" },
      medium: { variant: "secondary", color: "text-blue-700" },
      high: { variant: "default", color: "text-orange-700" },
      urgent: { variant: "destructive", color: "text-red-700" },
    }
    const config = variants[priority] || variants.low
    return (
      <Badge variant={config.variant} className="capitalize">
        {priority}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "destructive",
      "in-progress": "default",
      resolved: "secondary",
      closed: "outline",
    }
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status.replace("-", " ")}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {isAdmin ? "All Tickets" : "My Tickets"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-slate-600">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {isAdmin ? "All Tickets" : "My Tickets"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          {isAdmin ? "All Tickets" : "My Tickets"}
        </CardTitle>
        <CardDescription>
          {isAdmin ? "Overview of all reported issues" : "Track the status of your reported issues"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center text-sm text-slate-600">No tickets found</div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{ticket.ticket_number}</span>
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                    <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {isAdmin && ticket.employee && (
                        <span>
                          By: {ticket.employee.first_name} {ticket.employee.last_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {ticket.assigned && (
                        <span>
                          Assigned: {ticket.assigned.first_name} {ticket.assigned.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {ticket.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
