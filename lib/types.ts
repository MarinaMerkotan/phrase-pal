export type CardStatus = "learning" | "learned";

export const SET_TAGS = ["phrases", "nouns", "verbs", "adjectives", "adverbs", "development", "other"] as const;
export type SetTag = (typeof SET_TAGS)[number];

export type VocabularyCard = {
  id: string;
  set_id: string;
  term: string;
  translation: string;
  status: CardStatus;
  position: number;
  correct_answers: number;
  incorrect_answers: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VocabularySet = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: SetTag[];
  created_at: string;
  updated_at: string;
  cards: VocabularyCard[];
};

export type SetStats = {
  total: number;
  learning: number;
  learned: number;
  progress: number;
};

export function getSetStats(set: Pick<VocabularySet, "cards">): SetStats {
  const total = set.cards.length;
  const learned = set.cards.filter((card) => card.status === "learned").length;
  const learning = total - learned;
  return { total, learning, learned, progress: total ? Math.round((learned / total) * 100) : 0 };
}

export type CurrentUser = {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};
