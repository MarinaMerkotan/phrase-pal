ALTER TABLE public.vocabulary_sets
  ADD COLUMN kind text NOT NULL DEFAULT 'vocabulary' CHECK (kind IN ('vocabulary', 'text')),
  ADD COLUMN text_content jsonb NOT NULL DEFAULT '{"version":1,"paragraphs":[]}'::jsonb;
