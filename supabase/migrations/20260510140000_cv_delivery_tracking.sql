-- Add delivery tracking columns to cv_download_requests
alter table public.cv_download_requests
  add column if not exists resend_message_id text,
  add column if not exists delivery_status text not null default 'pending'
    check (delivery_status in ('pending', 'sending', 'delivered', 'failed'));
