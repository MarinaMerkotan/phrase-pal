DROP INDEX IF EXISTS vocabulary_sets_user_id_pinned_updated_at_idx;

ALTER TABLE public.vocabulary_sets
  DROP COLUMN IF EXISTS is_pinned;
