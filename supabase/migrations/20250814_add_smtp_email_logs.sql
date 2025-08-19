-- Create table to log simulated SMTP sends
create table if not exists public.smtp_email_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  from_address text not null,
  to_address text not null,
  subject text not null,
  body_text text,
  body_html text,
  provider text default 'zoho_smtp_sim',
  metadata jsonb,
  status text default 'queued'
);

create index if not exists idx_smtp_email_logs_created_at on public.smtp_email_logs(created_at desc);
create index if not exists idx_smtp_email_logs_to_address on public.smtp_email_logs(to_address);
