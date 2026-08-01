"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "uk" | "en";
type Dictionary = Record<string, string>;

const dictionaries: Record<Lang, Dictionary> = {
  uk: {
    appName: "Phrase Pal", tagline: "Вивчай слова. Говори впевнено.", welcome: "Вітаємо у Phrase Pal", signInSubtitle: "Увійди, щоб синхронізувати набори та прогрес.", google: "Продовжити з Google", sets: "Набори", study: "Навчання", progress: "Прогрес", profile: "Профіль", newSet: "Новий набір", searchSets: "Пошук наборів…", emptySets: "Наборів ще немає", emptySetsBody: "Створи перший набір слів і почни навчання.", words: "слів", learned: "Вивчені", learning: "Вивчаю", all: "Усі", addWord: "Додати слово", import: "Імпорт", edit: "Редагувати", delete: "Видалити", deleteConfirm: "Видалити цей набір?", deleteDescription: "Набір і всі слова буде видалено без можливості відновлення.", cancel: "Скасувати", save: "Зберегти", create: "Створити", back: "Назад", next: "Далі", previous: "Назад", title: "Назва", description: "Опис", englishTerm: "Англійське слово", ukrainianTranslation: "Український переклад", createSet: "Створити набір", editSet: "Редагувати набір", searchCards: "Пошук англійською або українською…", noCards: "У цьому наборі ще немає слів.", noCardsBody: "Додай слово вручну або імпортуй список.", filterLearning: "Вивчаю", filterLearned: "Вивчені", studyTitle: "Картки", directionEnUk: "EN → UK", directionUkEn: "UK → EN", tapToFlip: "Натисни, щоб перевернути", stillLearning: "Ще вивчаю", markLearned: "Вивчено", shuffle: "Перемішати", pronounce: "Вимовити", studyDone: "Сесію завершено", studyDoneBody: "Чудова робота! Повтори набір ще раз, коли будеш готовий.", again: "Ще раз", complete: "Завершити", chooseMode: "Обери режим тесту", multipleChoice: "Варіанти відповіді", written: "Письмова відповідь", translationPrompt: "Обери англійський відповідник", writePrompt: "Напиши англійське слово", check: "Перевірити", correct: "Правильно", incorrect: "Неправильно", showAnswer: "Правильна відповідь", testResults: "Результати тесту", importTitle: "Масовий імпорт", paste: "Вставити текст", json: "JSON-файл", preview: "Перевірка імпорту", parse: "Переглянути", importSelected: "Імпортувати вибрані", valid: "Коректно", invalid: "Помилка", duplicate: "Дублікат", remove: "Прибрати", rowsReady: "готово до імпорту", pasteHint: "Один рядок — одна пара. Пріоритет: Tab, em dash, пробіли + дефіс, двокрапка.", theme: "Тема", language: "Мова", dark: "Темна", light: "Світла", system: "Системна", signOut: "Вийти", totalWords: "Всього слів", learnedWords: "Вивчено слів", activeSets: "Активні набори", noProgress: "Прогрес з'явиться після першого навчання.", authError: "Не вдалося увійти. Перевір налаштування Nhost.", missingConfig: "Додай Nhost змінні середовища, щоб підключити акаунт.", notFound: "Не знайдено", retry: "Спробувати ще", loading: "Завантаження…", error: "Помилка завантаження", confirm: "Підтвердити", close: "Закрити", settings: "Налаштування", test: "Тест", start: "Почати", correctAnswers: "Правильні", incorrectAnswers: "Неправильні", percent: "Результат",
  },
  en: {
    appName: "Phrase Pal", tagline: "Learn words. Speak with confidence.", welcome: "Welcome to Phrase Pal", signInSubtitle: "Sign in to sync your sets and progress.", google: "Continue with Google", sets: "Sets", study: "Study", progress: "Progress", profile: "Profile", newSet: "New set", searchSets: "Search sets…", emptySets: "No sets yet", emptySetsBody: "Create your first vocabulary set and start learning.", words: "words", learned: "Learned", learning: "Learning", all: "All", addWord: "Add word", import: "Import", edit: "Edit", delete: "Delete", deleteConfirm: "Delete this set?", deleteDescription: "The set and all its words will be permanently deleted.", cancel: "Cancel", save: "Save", create: "Create", back: "Back", next: "Next", previous: "Previous", title: "Title", description: "Description", englishTerm: "English term", ukrainianTranslation: "Ukrainian translation", createSet: "Create set", editSet: "Edit set", searchCards: "Search English or Ukrainian…", noCards: "This set has no words yet.", noCardsBody: "Add a word manually or import a list.", filterLearning: "Learning", filterLearned: "Learned", studyTitle: "Flashcards", directionEnUk: "EN → UK", directionUkEn: "UK → EN", tapToFlip: "Tap to flip", stillLearning: "Still learning", markLearned: "Learned", shuffle: "Shuffle", pronounce: "Pronounce", studyDone: "Session complete", studyDoneBody: "Great work! Come back and repeat the set when you are ready.", again: "Again", complete: "Finish", chooseMode: "Choose a test mode", multipleChoice: "Multiple choice", written: "Written answer", translationPrompt: "Choose the English match", writePrompt: "Write the English word", check: "Check", correct: "Correct", incorrect: "Incorrect", showAnswer: "Correct answer", testResults: "Test results", importTitle: "Bulk import", paste: "Paste text", json: "JSON file", preview: "Review import", parse: "Preview", importSelected: "Import selected", valid: "Valid", invalid: "Invalid", duplicate: "Duplicate", remove: "Remove", rowsReady: "ready to import", pasteHint: "One pair per line. Priority: Tab, em dash, spaced hyphen, colon.", theme: "Theme", language: "Language", dark: "Dark", light: "Light", system: "System", signOut: "Sign out", totalWords: "Total words", learnedWords: "Learned words", activeSets: "Active sets", noProgress: "Progress will appear after your first study session.", authError: "Sign in failed. Check your Nhost configuration.", missingConfig: "Add the Nhost environment variables to connect your account.", notFound: "Not found", retry: "Try again", loading: "Loading…", error: "Loading error", confirm: "Confirm", close: "Close", settings: "Settings", test: "Test", start: "Start", correctAnswers: "Correct", incorrectAnswers: "Incorrect", percent: "Result",
  },
};

const selfCheckDictionaries: Record<Lang, Dictionary> = {
  uk: {
    selfCheck: "Самоперевірка",
    ukrainianPrompt: "Фраза українською",
    sayEnglishAloud: "Скажи англійський варіант уголос, а потім відкрий відповідь.",
    englishAnswer: "Англійський варіант",
    listenEnglish: "Прослухати англійською",
    speechUnavailable: "Озвучення не підтримується цим браузером",
    selfCheckDone: "Самоперевірку завершено",
    selfCheckDoneBody: "Ти самостійно повторив увесь набір — без оцінок і розпізнавання голосу.",
    phrasesReviewed: "фраз переглянуто",
    selfCheckShortcut: "Пробіл або Enter — відкрити відповідь / перейти далі",
    noLearnedSelfCheck: "Ще немає вивчених слів",
    noLearnedSelfCheckBody: "Познач слова як вивчені або обери «Усі», щоб перевірити весь набір.",
    pronunciationPractice: "Тренування вимови",
    translateAndSay: "Переклади та скажи англійською",
    pronunciationPrompt: "Пригадай англійський варіант, затисни мікрофон і скажи його вголос.",
    holdToSpeak: "Затисни, щоб говорити",
    releaseToCheck: "Відпусти кнопку, щоб перевірити відповідь",
    listening: "Слухаю…",
    listeningEllipsis: "Говори англійською…",
    liveTranscript: "Розпізнаю зараз",
    pronunciationResult: "Результат",
    youSaid: "Ти сказав(-ла)",
    correctAnswer: "Правильна відповідь",
    matched: "Збіглося",
    needsWork: "Варто повторити",
    tryAgain: "Спробувати ще",
    browserSpeechNote: "Цей режим порівнює розпізнаний текст із правильною відповіддю. Він допомагає помітити пропущені або змінені слова, але не оцінює акцент і окремі звуки.",
    phraseProgress: "Фраза {current} із {total}",
    speakFromMemory: "Скажи з пам’яті",
    pronunciationDone: "Тренування завершено",
    pronunciationDoneBody: "Ти проговорив(-ла) всі фрази в наборі.",
    averageMatch: "середній збіг із відповіддю",
    speechRecognitionUnavailable: "Розпізнавання мовлення недоступне",
    speechRecognitionUnavailableBody: "Відкрий цю сторінку в актуальній версії Chrome, Edge або Safari та дозволь доступ до мікрофона.",
    "speechRecognitionError.not-allowed": "Немає доступу до мікрофона. Дозволь його в налаштуваннях браузера.",
    "speechRecognitionError.service-not-allowed": "Браузер заблокував сервіс розпізнавання мовлення.",
    "speechRecognitionError.no-speech": "Не вдалося почути мовлення. Спробуй ще раз і говори ближче до мікрофона.",
    "speechRecognitionError.audio-capture": "Мікрофон недоступний або використовується іншою програмою.",
    "speechRecognitionError.network": "Сервіс розпізнавання мовлення зараз недоступний через мережу.",
    "speechRecognitionError.start-failed": "Не вдалося запустити мікрофон. Спробуй ще раз.",
    "speechRecognitionError.generic": "Не вдалося розпізнати мовлення. Спробуй ще раз.",
    "pronunciationScore.great": "Чудово звучить",
    "pronunciationScore.close": "Майже правильно",
    "pronunciationScore.retry": "Спробуй ще раз",
  },
  en: {
    selfCheck: "Self-check",
    ukrainianPrompt: "Ukrainian phrase",
    sayEnglishAloud: "Say the English version aloud, then reveal the answer.",
    englishAnswer: "English version",
    listenEnglish: "Listen in English",
    speechUnavailable: "Speech playback is not supported by this browser",
    selfCheckDone: "Self-check complete",
    selfCheckDoneBody: "You reviewed the whole set yourself — with no scoring or voice recognition.",
    phrasesReviewed: "phrases reviewed",
    selfCheckShortcut: "Space or Enter — reveal the answer / continue",
    noLearnedSelfCheck: "No learned words yet",
    noLearnedSelfCheckBody: "Mark some words as learned or choose “All” to review the whole set.",
    pronunciationPractice: "Pronunciation practice",
    translateAndSay: "Translate and say it in English",
    pronunciationPrompt: "Recall the English version, hold the microphone, and say it aloud.",
    holdToSpeak: "Hold to speak",
    releaseToCheck: "Release the button to check your answer",
    listening: "Listening…",
    listeningEllipsis: "Speak in English…",
    liveTranscript: "Recognizing now",
    pronunciationResult: "Result",
    youSaid: "You said",
    correctAnswer: "Correct answer",
    matched: "Matched",
    needsWork: "Needs practice",
    tryAgain: "Try again",
    browserSpeechNote: "This mode compares the recognized text with the correct answer. It can spot missing or changed words, but it does not score your accent or individual sounds.",
    phraseProgress: "Phrase {current} of {total}",
    speakFromMemory: "Speak from memory",
    pronunciationDone: "Practice complete",
    pronunciationDoneBody: "You spoke every phrase in the set.",
    averageMatch: "average answer match",
    speechRecognitionUnavailable: "Speech recognition is unavailable",
    speechRecognitionUnavailableBody: "Open this page in a current version of Chrome, Edge, or Safari and allow microphone access.",
    "speechRecognitionError.not-allowed": "Microphone access is blocked. Allow it in your browser settings.",
    "speechRecognitionError.service-not-allowed": "The browser blocked the speech recognition service.",
    "speechRecognitionError.no-speech": "No speech was detected. Try again and speak closer to the microphone.",
    "speechRecognitionError.audio-capture": "The microphone is unavailable or being used by another app.",
    "speechRecognitionError.network": "The speech recognition service is currently unavailable over the network.",
    "speechRecognitionError.start-failed": "The microphone could not be started. Please try again.",
    "speechRecognitionError.generic": "Speech could not be recognized. Please try again.",
    "pronunciationScore.great": "Sounds great",
    "pronunciationScore.close": "Almost there",
    "pronunciationScore.retry": "Try once more",
  },
};

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void; t: (key: string) => string }>({ lang: "uk", setLang: () => undefined, t: (key) => key });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "uk";
    const stored = window.localStorage.getItem("phrase-pal.lang");
    return stored === "uk" || stored === "en" ? stored : "uk";
  });
  const setLang = (next: Lang) => { setLangState(next); window.localStorage.setItem("phrase-pal.lang", next); };
  const value = useMemo(() => ({ lang, setLang, t: (key: string) => dictionaries[lang][key] ?? selfCheckDictionaries[lang][key] ?? key }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useI18n = () => useContext(LangContext);
