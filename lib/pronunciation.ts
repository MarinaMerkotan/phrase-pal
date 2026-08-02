export type CharacterMatch = {
  character: string;
  correct: boolean;
};

export type WordMatch = {
  expected: string | null;
  spoken: string | null;
  expectedCharacters: CharacterMatch[];
  spokenCharacters: CharacterMatch[];
};

export type PronunciationComparison = {
  words: WordMatch[];
  score: number;
};

function normalizeWord(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
}

function isComparableCharacter(character: string) {
  return /[a-z0-9]/i.test(character);
}

function characterMatches(value: string, counterpart: string) {
  const source = [...value];
  const normalizedSource = [...normalizeWord(value)];
  const normalizedCounterpart = [...normalizeWord(counterpart)];
  const rows = normalizedSource.length + 1;
  const columns = normalizedCounterpart.length + 1;
  const lcs = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      lcs[row][column] = normalizedSource[row - 1] === normalizedCounterpart[column - 1]
        ? lcs[row - 1][column - 1] + 1
        : Math.max(lcs[row - 1][column], lcs[row][column - 1]);
    }
  }

  const matchedIndexes = new Set<number>();
  let row = normalizedSource.length;
  let column = normalizedCounterpart.length;
  while (row > 0 && column > 0) {
    if (normalizedSource[row - 1] === normalizedCounterpart[column - 1]) {
      matchedIndexes.add(row - 1);
      row -= 1;
      column -= 1;
    } else if (lcs[row - 1][column] >= lcs[row][column - 1]) {
      row -= 1;
    } else {
      column -= 1;
    }
  }

  let normalizedIndex = 0;
  return source.map((character) => {
    const isComparable = isComparableCharacter(character);
    const correct = !isComparable || matchedIndexes.has(normalizedIndex);
    if (isComparable) normalizedIndex += 1;
    return { character, correct };
  });
}

export function comparePronunciation(expectedSentence: string, spokenSentence: string): PronunciationComparison {
  const expectedWords = expectedSentence.trim().split(/\s+/).filter(Boolean);
  const spokenWords = spokenSentence.trim().split(/\s+/).filter(Boolean);
  const rows = expectedWords.length + 1;
  const columns = spokenWords.length + 1;
  const distance = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) distance[row][0] = row;
  for (let column = 0; column < columns; column += 1) distance[0][column] = column;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = normalizeWord(expectedWords[row - 1]) === normalizeWord(spokenWords[column - 1]) ? 0 : 1;
      distance[row][column] = Math.min(
        distance[row - 1][column] + 1,
        distance[row][column - 1] + 1,
        distance[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  const reversed: Array<{ expected: string | null; spoken: string | null }> = [];
  let row = expectedWords.length;
  let column = spokenWords.length;

  while (row > 0 || column > 0) {
    const expected = row > 0 ? expectedWords[row - 1] : null;
    const spoken = column > 0 ? spokenWords[column - 1] : null;
    const substitutionCost = expected && spoken && normalizeWord(expected) === normalizeWord(spoken) ? 0 : 1;

    if (row > 0 && column > 0 && distance[row][column] === distance[row - 1][column - 1] + substitutionCost) {
      reversed.push({ expected, spoken });
      row -= 1;
      column -= 1;
    } else if (row > 0 && distance[row][column] === distance[row - 1][column] + 1) {
      reversed.push({ expected, spoken: null });
      row -= 1;
    } else {
      reversed.push({ expected: null, spoken });
      column -= 1;
    }
  }

  const aligned = reversed.reverse();
  const words = aligned.map(({ expected, spoken }) => ({
    expected,
    spoken,
    expectedCharacters: expected ? characterMatches(expected, spoken ?? "") : [],
    spokenCharacters: spoken ? characterMatches(spoken, expected ?? "") : [],
  }));
  const expectedCharacterCount = [...expectedWords.join("")].filter(isComparableCharacter).length;
  const spokenCharacterCount = [...spokenWords.join("")].filter(isComparableCharacter).length;
  const correctCharacterCount = words.reduce(
    (total, word) => total + word.expectedCharacters.filter(({ character, correct }) => isComparableCharacter(character) && correct).length,
    0,
  );

  return {
    words,
    score: expectedCharacterCount ? Math.round((correctCharacterCount / Math.max(expectedCharacterCount, spokenCharacterCount)) * 100) : 0,
  };
}
