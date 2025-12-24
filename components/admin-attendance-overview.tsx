"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Clock } from "lucide-react"
import { useEffect, useState } from "react"

export function AdminAttendanceOverview() {
  const [todayAttendance, setTodayAttendance] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTodayAttendance()
  }, [])

  const fetchTodayAttendance = async () => {
    setIsLoading(true)
    const today = new Date().toISOString().split("T")[0]

    // Get all active employees
    const { data: employees } = await supabase.from("employees").select("*").eq("is_active", true)

    // Get today's attendance
    const { data: attendance } = await supabase
      .from("attendance")
      .select(
        `
        *,
        employee:employees(first_name, last_name, department)
      `,
      )
      .eq("date", today)

    const totalEmployees = employees?.length || 0
    const presentCount = attendance?.filter((a) => a.status === "present").length || 0
    const lateCount = attendance?.filter((a) => a.status === "late").length || 0

    setStats({
      total: totalEmployees,
      present: presentCount,
      absent: totalEmployees - (attendance?.length || 0),
      late: lateCount,
    })

    setTodayAttendance(attendance || [])
    setIsLoading(false)
  }

  const statCards = [
    {
      title: "Total Employees",
      value: stats.total,
      icon: Users,
      color: "text-slate-700",
      bgColor: "bg-slate-100",
    },
    {
      title: "Present Today",
      value: stats.present,
      icon: UserCheck,
      color: "text-green-700",
      bgColor: "bg-green-100",
    },
    {
      title: "Absent",
      value: stats.absent,
      icon: UserX,
      color: "text-red-700",
      bgColor: "bg-red-100",
    },
    {
      title: "Late",
      value: stats.late,
      icon: Clock,
      color: "text-orange-700",
      bgColor: "bg-orange-100",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Attendance Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse rounded bg-slate-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Attendance Overview</h2>
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

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Clock in/out records for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todayAttendance.length === 0 ? (
            <div className="text-center text-sm text-slate-600">No attendance records for today</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.employee?.first_name} {record.employee?.last_name}
                      </TableCell>
                      <TableCell>{record.employee?.department}</TableCell>
                      <TableCell>
                        {new Date(record.clock_in).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {record.clock_out
                          ? new Date(record.clock_out).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.status === "present" ? "default" : "secondary"} className="capitalize">
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
