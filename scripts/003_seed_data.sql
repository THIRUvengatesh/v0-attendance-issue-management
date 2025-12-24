-- Note: This script assumes auth.users will be populated separately
-- We'll create employee records that link to auth users

-- Generate ticket numbers function
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  ticket_count INTEGER;
  ticket_num TEXT;
BEGIN
  SELECT COUNT(*) INTO ticket_count FROM tickets;
  ticket_num := 'PACS-' || LPAD((ticket_count + 1)::TEXT, 5, '0');
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Sample departments and positions for reference
-- Actual employee data will be inserted after auth users are created
-- This is handled in the application during the sign-up flow

-- Insert some sample ticket categories and their descriptions as comments
COMMENT ON COLUMN tickets.category IS 'Valid categories: hardware, software, network, facilities, hr, other';
COMMENT ON COLUMN tickets.priority IS 'Valid priorities: low, medium, high, urgent';
COMMENT ON COLUMN tickets.status IS 'Valid statuses: open, in-progress, resolved, closed';
COMMENT ON COLUMN leave_requests.leave_type IS 'Valid types: vacation, sick, personal, emergency, other';
COMMENT ON COLUMN leave_requests.status IS 'Valid statuses: pending, approved, rejected';
