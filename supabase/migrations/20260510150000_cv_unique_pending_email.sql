-- Remove duplicate pending requests (keep the earliest one per email)
DELETE FROM public.cv_download_requests a
  USING public.cv_download_requests b
  WHERE a.email = b.email
    AND a.status = 'pending'
    AND b.status = 'pending'
    AND a.requested_at > b.requested_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cv_requests_unique_pending_email
  ON public.cv_download_requests (email)
  WHERE status = 'pending';
