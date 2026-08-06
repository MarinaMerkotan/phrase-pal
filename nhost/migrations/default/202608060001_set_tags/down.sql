ALTER TABLE public.vocabulary_sets
  DROP CONSTRAINT IF EXISTS vocabulary_sets_tags_allowed;

ALTER TABLE public.vocabulary_sets
  DROP COLUMN IF EXISTS tags;
