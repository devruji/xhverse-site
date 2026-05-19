DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_context_other_length'
      AND conrelid = 'public.cv_download_requests'::regclass
  ) THEN
    ALTER TABLE public.cv_download_requests
      ADD CONSTRAINT chk_context_other_length
      CHECK (context_other IS NULL OR length(context_other) <= 200);
  END IF;
END $$;
