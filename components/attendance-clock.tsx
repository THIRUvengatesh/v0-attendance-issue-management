"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, LogIn, LogOut } from "lucide-react"
import { useEffect, useState } from "react"

interface AttendanceClockProps {
  userId: string
}

export function AttendanceClock({ userId }: AttendanceClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    fetchTodayAttendance()
    return () => clearInterval(timer)
  }, [])

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", userId)
        .eq("date", today)
        .order("clock_in", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Fetch attendance error:", error)
        setError("Failed to load attendance data")
        return
      }

      setTodayAttendance(data)
      setError(null)
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      setError("Failed to load attendance data")
    }
  }

  const handleClockIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const now = new Date()
      const today = now.toISOString().split("T")[0]

      const { error } = await supabase.from("attendance").insert({
        employee_id: userId,
        clock_in: now.toISOString(),
        date: today,
        status: "present",
      })

      if (error) throw error
      await fetchTodayAttendance()
    } catch (error: any) {
      console.error("[v0] Clock in error:", error)
      setError(error.message || "Failed to clock in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!todayAttendance) return

    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from("attendance")
        .update({ clock_out: new Date().toISOString() })
        .eq("id", todayAttendance.id)

      if (error) throw error
      await fetchTodayAttendance()
    } catch (error: any) {
      console.error("[v0] Clock out error:", error)
      setError(error.message || "Failed to clock out")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const isClockedIn = todayAttendance && !todayAttendance.clock_out

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Clock In/Out
        </CardTitle>
        <CardDescription>Record your attendance for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums text-slate-900">{formatTime(currentTime)}</div>
          <div className="text-sm text-slate-600">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {todayAttendance && (
          <div className="space-y-2 rounded-lg bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Clock In:</span>
              <span className="font-medium">
                {new Date(todayAttendance.clock_in).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {todayAttendance.clock_out && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Clock Out:</span>
                <span className="font-medium">
                  {new Date(todayAttendance.clock_out).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleClockIn}
            disabled={isClockedIn || isLoading}
            className="flex-1"
            variant={isClockedIn ? "outline" : "default"}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Clock In
          </Button>
          <Button
            onClick={handleClockOut}
            disabled={!isClockedIn || isLoading}
            className="flex-1"
            variant={!isClockedIn ? "outline" : "default"}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Clock Out
          </Button>
        </div>

        {isClockedIn && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-800">
            You are currently clocked in
          </div>
        )}
      </CardContent>
    </Card>
  )
}
