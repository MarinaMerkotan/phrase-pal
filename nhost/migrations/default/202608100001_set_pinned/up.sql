ALTER TABLE public.vocabulary_sets
  ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

CREATE INDEX vocabulary_sets_user_id_pinned_updated_at_idx
  ON public.vocabulary_sets (user_id, is_pinned DESC, updated_at DESC);
