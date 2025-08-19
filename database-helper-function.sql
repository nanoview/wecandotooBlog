-- Helper function to get database tables (if RLS allows)
CREATE OR REPLACE FUNCTION get_database_tables()
RETURNS TABLE (
  table_name text,
  table_schema text,
  table_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    t.table_schema::text,
    t.table_type::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
