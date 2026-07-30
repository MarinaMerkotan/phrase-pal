import { nhost } from "./client";
import type { CardStatus, VocabularyCard, VocabularySet } from "../types";

type GraphQLResponse<T> = { data?: T };
type SetRow = Omit<VocabularySet, "cards"> & { vocabulary_cards: VocabularyCard[] };

function toSet(row: SetRow): VocabularySet {
  return { ...row, cards: row.vocabulary_cards ?? [] };
}

async function request<T, V extends Record<string, unknown> = Record<string, never>>(query: string, variables?: V): Promise<T> {
  const response = await nhost.graphql.request<T, V>({ query, variables });
  const body = response.body as GraphQLResponse<T>;
  if (!body.data) throw new Error("Nhost returned no data");
  return body.data;
}

const setFields = `id user_id title description created_at updated_at vocabulary_cards { id set_id term translation status position correct_answers incorrect_answers last_reviewed_at created_at updated_at }`;

export async function listSets(search = "") {
  const data = await request<{ vocabulary_sets: SetRow[] }, { search: string }>(`query ListSets($search: String!) { vocabulary_sets(where: { title: { _ilike: $search } }, order_by: { updated_at: desc }) { ${setFields} } }`, { search: `%${search}%` });
  return data.vocabulary_sets.map(toSet);
}

export async function getSet(id: string) {
  const data = await request<{ vocabulary_sets_by_pk: SetRow | null }, { id: string }>(`query GetSet($id: uuid!) { vocabulary_sets_by_pk(id: $id) { ${setFields} } }`, { id });
  return data.vocabulary_sets_by_pk ? toSet(data.vocabulary_sets_by_pk) : null;
}

export async function createSet(input: { title: string; description?: string | null }) {
  const data = await request<{ insert_vocabulary_sets_one: SetRow }, { object: { title: string; description?: string | null } }>(`mutation CreateSet($object: vocabulary_sets_insert_input!) { insert_vocabulary_sets_one(object: $object) { ${setFields} } }`, { object: input });
  return toSet(data.insert_vocabulary_sets_one);
}

export async function updateSet(id: string, input: { title: string; description?: string | null }) {
  const data = await request<{ update_vocabulary_sets_by_pk: SetRow }, { id: string; object: { title: string; description?: string | null } }>(`mutation UpdateSet($id: uuid!, $object: vocabulary_sets_set_input!) { update_vocabulary_sets_by_pk(pk_columns: { id: $id }, _set: $object) { ${setFields} } }`, { id, object: input });
  return toSet(data.update_vocabulary_sets_by_pk);
}

export async function deleteSet(id: string) {
  await request<{ delete_vocabulary_sets_by_pk: { id: string } | null }, { id: string }>(`mutation DeleteSet($id: uuid!) { delete_vocabulary_sets_by_pk(id: $id) { id } }`, { id });
}

export async function createCard(setId: string, input: { term: string; translation: string; position?: number }) {
  const data = await request<{ insert_vocabulary_cards_one: VocabularyCard }, { object: { set_id: string; term: string; translation: string; position: number } }>(`mutation CreateCard($object: vocabulary_cards_insert_input!) { insert_vocabulary_cards_one(object: $object) { id set_id term translation status position correct_answers incorrect_answers last_reviewed_at created_at updated_at } }`, { object: { set_id: setId, position: input.position ?? 0, term: input.term, translation: input.translation } });
  return data.insert_vocabulary_cards_one;
}

export async function createCards(setId: string, cards: Array<{ term: string; translation: string; position: number }>) {
  await request<{ insert_vocabulary_cards: { affected_rows: number } }, { objects: Array<{ set_id: string; term: string; translation: string; position: number }> }>(`mutation CreateCards($objects: [vocabulary_cards_insert_input!]!) { insert_vocabulary_cards(objects: $objects) { affected_rows } }`, { objects: cards.map((card) => ({ ...card, set_id: setId })) });
}

export async function updateCard(id: string, input: { term?: string; translation?: string; status?: CardStatus; correct_answers?: number; incorrect_answers?: number }) {
  const data = await request<{ update_vocabulary_cards_by_pk: VocabularyCard }, { id: string; object: typeof input }>(`mutation UpdateCard($id: uuid!, $object: vocabulary_cards_set_input!) { update_vocabulary_cards_by_pk(pk_columns: { id: $id }, _set: $object) { id set_id term translation status position correct_answers incorrect_answers last_reviewed_at created_at updated_at } }`, { id, object: input });
  return data.update_vocabulary_cards_by_pk;
}

export async function deleteCard(id: string) {
  await request<{ delete_vocabulary_cards_by_pk: { id: string } | null }, { id: string }>(`mutation DeleteCard($id: uuid!) { delete_vocabulary_cards_by_pk(id: $id) { id } }`, { id });
}
