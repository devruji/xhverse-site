ALTER TABLE public.cv_download_requests
  ADD COLUMN IF NOT EXISTS context_other text;
