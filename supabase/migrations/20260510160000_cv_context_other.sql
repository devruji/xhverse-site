ALTER TABLE public.cv_download_requests
  ADD COLUMN IF NOT EXISTS context_other text
  CONSTRAINT chk_context_other_length CHECK (context_other IS NULL OR length(context_other) <= 200);
