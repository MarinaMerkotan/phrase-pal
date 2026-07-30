CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.vocabulary_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vocabulary_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.vocabulary_sets(id) ON DELETE CASCADE,
  term text NOT NULL CHECK (length(btrim(term)) > 0),
  translation text NOT NULL CHECK (length(btrim(translation)) > 0),
  status text NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'learned')),
  position integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  incorrect_answers integer NOT NULL DEFAULT 0 CHECK (incorrect_answers >= 0),
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX vocabulary_sets_user_id_updated_at_idx ON public.vocabulary_sets (user_id, updated_at DESC);
CREATE INDEX vocabulary_cards_set_id_position_idx ON public.vocabulary_cards (set_id, position);
CREATE INDEX vocabulary_cards_set_id_status_idx ON public.vocabulary_cards (set_id, status);
CREATE UNIQUE INDEX vocabulary_cards_set_id_normalized_term_idx ON public.vocabulary_cards (set_id, lower(regexp_replace(btrim(term), '\\s+', ' ', 'g')));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER vocabulary_sets_updated_at BEFORE UPDATE ON public.vocabulary_sets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER vocabulary_cards_updated_at BEFORE UPDATE ON public.vocabulary_cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
