// /root/app/apps/duolingo/data/italianLessons.ts
import { Lesson } from "../types/DuolingoTypes";

export const italianLessons: Lesson[] = [
  {
    id: "basics-1",
    title: "Basics 1",
    exercises: [
      {
        id: "ex1",
        type: "TRANSLATE_TO_ITALIAN",
        prompt: 'Translate "the boy"',
        correctAnswer: ["il ragazzo"],
        options: ["la", "ragazzo", "il", "mela", "uomo"], // Word bank style
      },
      {
        id: "ex2",
        type: "MULTIPLE_CHOICE_TRANSLATE",
        prompt: 'Which one is "the apple"?',
        options: ["il ragazzo", "la donna", "la mela", "io sono"],
        correctAnswer: "la mela",
      },
      {
        id: "ex3",
        type: "TRANSLATE_TO_ENGLISH",
        prompt: 'Translate "Io sono una donna"',
        correctAnswer: ["i am a woman", "i'm a woman"], // Accept variations
        options: ["am", "a", "I", "man", "woman", "apple", "eat"],
      },
      {
        id: "ex4",
        type: "MATCH_PAIRS",
        prompt: "Match the pairs",
        pairs: [
          { id: "p1a", text: "boy", matchId: "p1b" },
          { id: "p1b", text: "ragazzo", matchId: "p1a" },
          { id: "p2a", text: "apple", matchId: "p2b" },
          { id: "p2b", text: "mela", matchId: "p2a" },
          { id: "p3a", text: "I am", matchId: "p3b" },
          { id: "p3b", text: "io sono", matchId: "p3a" },
        ],
      },
      {
        id: "ex5",
        type: "MULTIPLE_CHOICE_TRANSLATE",
        prompt: 'Which one is "you are"?',
        options: ["lui è", "tu sei", "noi siamo", "io sono"],
        correctAnswer: "tu sei",
      },
    ],
  },
  {
    id: "phrases-1",
    title: "Phrases 1",
    exercises: [
      {
        id: "ph1",
        type: "TRANSLATE_TO_ITALIAN",
        prompt: 'Translate "thank you"',
        correctAnswer: ["grazie"],
        options: ["prego", "ciao", "grazie", "si", "no"],
      },
      {
        id: "ph2",
        type: "MULTIPLE_CHOICE_TRANSLATE",
        prompt: 'Which one is "yes, please"?',
        options: ["no grazie", "si prego", "ciao", "buongiorno"],
        correctAnswer: "si prego",
      },
      // Add more exercises...
    ],
  },
  // Add more lessons...
];
