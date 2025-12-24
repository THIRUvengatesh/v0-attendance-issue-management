import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Get employee role to determine redirect
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("role")
      .eq("id", authData.user.id)
      .single()

    if (employeeError) {
      console.error("[v0] Error fetching employee role:", employeeError)
      return NextResponse.json({ error: "Failed to fetch user role" }, { status: 500 })
    }

    // Return success with user info and redirect path
    return NextResponse.json({
      success: true,
      user: authData.user,
      role: employee?.role || "employee",
      redirectTo: employee?.role === "admin" ? "/admin" : "/dashboard",
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
