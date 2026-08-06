ALTER TABLE public.vocabulary_sets
  ADD COLUMN tags text[] NOT NULL DEFAULT ARRAY[]::text[];

ALTER TABLE public.vocabulary_sets
  ADD CONSTRAINT vocabulary_sets_tags_allowed
  CHECK (tags <@ ARRAY['phrases', 'nouns', 'verbs', 'adjectives', 'adverbs', 'development', 'other']::text[]);
