-- Enable Row Level Security on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "employees_select_own" ON employees
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "employees_select_all_for_admins" ON employees
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "employees_update_own" ON employees
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "employees_update_all_for_admins" ON employees
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));

-- Attendance policies
CREATE POLICY "attendance_select_own" ON attendance
  FOR SELECT USING (employee_id = auth.uid() OR EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "attendance_insert_own" ON attendance
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "attendance_update_own" ON attendance
  FOR UPDATE USING (employee_id = auth.uid() OR EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "attendance_delete_admin" ON attendance
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));

-- Tickets policies
CREATE POLICY "tickets_select_own_or_assigned" ON tickets
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "tickets_insert_own" ON tickets
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "tickets_update_own_or_assigned_or_admin" ON tickets
  FOR UPDATE USING (
    employee_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "tickets_delete_admin" ON tickets
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));

-- Ticket comments policies
CREATE POLICY "ticket_comments_select_if_ticket_visible" ON ticket_comments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_comments.ticket_id 
    AND (
      tickets.employee_id = auth.uid() OR 
      tickets.assigned_to = auth.uid() OR 
      EXISTS (SELECT 1 FROM employees WHERE employees.id = auth.uid() AND employees.role = 'admin')
    )
  ));

CREATE POLICY "ticket_comments_insert_if_ticket_visible" ON ticket_comments
  FOR INSERT WITH CHECK (
    employee_id = auth.uid() AND EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_comments.ticket_id 
      AND (
        tickets.employee_id = auth.uid() OR 
        tickets.assigned_to = auth.uid() OR 
        EXISTS (SELECT 1 FROM employees WHERE employees.id = auth.uid() AND employees.role = 'admin')
      )
    )
  );

-- Leave requests policies
CREATE POLICY "leave_requests_select_own_or_admin" ON leave_requests
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "leave_requests_insert_own" ON leave_requests
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "leave_requests_update_own_pending" ON leave_requests
  FOR UPDATE USING (employee_id = auth.uid() AND status = 'pending');

CREATE POLICY "leave_requests_update_admin" ON leave_requests
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'
  ));
