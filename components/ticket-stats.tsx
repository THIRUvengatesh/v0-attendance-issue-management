"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, Ticket } from "lucide-react"
import { useEffect, useState } from "react"

interface TicketStatsProps {
  userId?: string
  isAdmin?: boolean
}

export function TicketStats({ userId, isAdmin = false }: TicketStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)

    let query = supabase.from("tickets").select("status")

    if (!isAdmin && userId) {
      query = query.eq("employee_id", userId)
    }

    const { data } = await query

    if (data) {
      setStats({
        total: data.length,
        open: data.filter((t) => t.status === "open").length,
        inProgress: data.filter((t) => t.status === "in-progress").length,
        resolved: data.filter((t) => t.status === "resolved" || t.status === "closed").length,
      })
    }

    setIsLoading(false)
  }

  const statCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      color: "text-slate-700",
      bgColor: "bg-slate-100",
    },
    {
      title: "Open",
      value: stats.open,
      icon: AlertCircle,
      color: "text-red-700",
      bgColor: "bg-red-100",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-700",
      bgColor: "bg-green-100",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse rounded bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <div className={`${stat.bgColor} rounded-lg p-2`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
