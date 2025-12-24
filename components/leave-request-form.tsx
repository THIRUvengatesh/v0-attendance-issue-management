"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays } from "lucide-react"
import { useState } from "react"

interface LeaveRequestFormProps {
  userId: string
  onSuccess?: () => void
}

export function LeaveRequestForm({ userId, onSuccess }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    leaveType: "vacation",
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return days > 0 ? days : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const daysCount = calculateDays()
      if (daysCount <= 0) {
        throw new Error("End date must be after start date")
      }

      const { error: insertError } = await supabase.from("leave_requests").insert({
        employee_id: userId,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        days_count: daysCount,
        reason: formData.reason,
        status: "pending",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        leaveType: "vacation",
        startDate: "",
        endDate: "",
        reason: "",
      })
      onSuccess?.()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Request Leave
        </CardTitle>
        <CardDescription>Submit a leave request for approval</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select
              value={formData.leaveType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  leaveType: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
          {formData.startDate && formData.endDate && (
            <div className="text-sm text-slate-600">Total days: {calculateDays()}</div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              required
              placeholder="Please provide a reason for your leave request"
              value={formData.reason}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reason: e.target.value,
                })
              }
              rows={3}
            />
          </div>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              Leave request submitted successfully!
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
