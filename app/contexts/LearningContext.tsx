"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the lesson types to mirror Duolingo's format
export type ExerciseType =
  | "match"
  | "translate"
  | "select"
  | "complete"
  | "speak";

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  hint?: string;
  image?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  exercises: Exercise[];
  completed: boolean;
  locked: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  unlocked: boolean;
  completed: boolean;
}

interface LearningContextType {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  currentLesson: Lesson | null;
  currentExerciseIndex: number;
  progress: number;
  streak: number;
  xp: number;
  hearts: number;
  setCurrentChapter: (chapterId: string) => void;
  setCurrentLesson: (lessonId: string) => void;
  startLesson: (lessonId: string) => void;
  completeExercise: (correct: boolean) => void;
  completeLesson: () => void;
  resetLesson: () => void;
  nextExercise: () => void;
  isLessonActive: boolean;
}

// Create the context
const LearningContext = createContext<LearningContextType | undefined>(
  undefined
);

// Initial data structure for Italian Chapter 1 (Basics)
const initialItalianData: Chapter[] = [
  {
    id: "chapter-1",
    title: "Italian Basics",
    description: "Learn essential Italian greetings and simple phrases",
    unlocked: true,
    completed: false,
    lessons: [
      {
        id: "lesson-1",
        title: "Greetings",
        description: "Basic hello and goodbye",
        icon: "👋",
        completed: false,
        locked: false,
        exercises: [
          {
            id: "ex-1-1",
            type: "select",
            question: 'Choose the correct translation for "Hello"',
            options: ["Ciao", "Grazie", "Arrivederci", "Prego"],
            correctAnswer: "Ciao",
            hint: "This is the most common informal greeting in Italian",
          },
          {
            id: "ex-1-2",
            type: "match",
            question: "Match the pairs",
            options: [
              "Buongiorno",
              "Buonasera",
              "Arrivederci",
              "Good morning",
              "Good evening",
              "Goodbye",
            ],
            correctAnswer: [
              "Buongiorno|Good morning",
              "Buonasera|Good evening",
              "Arrivederci|Goodbye",
            ],
            hint: "Think about the time of day",
          },
          {
            id: "ex-1-3",
            type: "translate",
            question: 'Translate to Italian: "How are you?"',
            correctAnswer: ["Come stai", "Come sta", "Come va"],
            hint: 'Uses the word "come" (how)',
          },
          {
            id: "ex-1-4",
            type: "complete",
            question: 'Complete the phrase: "Buona ____, come stai?"',
            options: ["sera", "giorno", "notte", "mattina"],
            correctAnswer: "sera",
            hint: "This would be said in the evening",
          },
        ],
      },
      {
        id: "lesson-2",
        title: "Basic Phrases",
        description: "Essential expressions",
        icon: "💬",
        completed: false,
        locked: false,
        exercises: [
          {
            id: "ex-2-1",
            type: "select",
            question: 'What does "Grazie" mean?',
            options: ["Hello", "Thank you", "Goodbye", "Please"],
            correctAnswer: "Thank you",
          },
          {
            id: "ex-2-2",
            type: "translate",
            question: 'Translate to English: "Mi chiamo Marco"',
            correctAnswer: ["My name is Marco", "I am called Marco"],
            hint: "It's a way to introduce yourself",
          },
          {
            id: "ex-2-3",
            type: "select",
            question: 'Choose the correct translation for "Please"',
            options: ["Prego", "Scusa", "Ciao", "Grazie"],
            correctAnswer: "Prego",
          },
          {
            id: "ex-2-4",
            type: "match",
            question: "Match the Italian phrases with their English meanings",
            options: [
              "Scusa",
              "Prego",
              "Grazie mille",
              "Sorry/Excuse me",
              "You're welcome",
              "Thank you very much",
            ],
            correctAnswer: [
              "Scusa|Sorry/Excuse me",
              "Prego|You're welcome",
              "Grazie mille|Thank you very much",
            ],
          },
        ],
      },
      {
        id: "lesson-3",
        title: "Questions",
        description: "Ask simple questions",
        icon: "❓",
        completed: false,
        locked: true,
        exercises: [
          {
            id: "ex-3-1",
            type: "select",
            question: 'How do you ask "What is your name?" in Italian?',
            options: [
              "Come ti chiami?",
              "Dove sei?",
              "Quanti anni hai?",
              "Come stai?",
            ],
            correctAnswer: "Come ti chiami?",
          },
          {
            id: "ex-3-2",
            type: "translate",
            question: 'Translate to Italian: "Where is the restaurant?"',
            correctAnswer: ["Dov'è il ristorante?", "Dove è il ristorante?"],
            hint: 'Use "dove" (where) and "ristorante" (restaurant)',
          },
          {
            id: "ex-3-3",
            type: "select",
            question: 'Which phrase asks "How old are you?" in Italian',
            options: [
              "Quanti anni hai?",
              "Come stai?",
              "Dove abiti?",
              "Chi sei?",
            ],
            correctAnswer: "Quanti anni hai?",
          },
          {
            id: "ex-3-4",
            type: "complete",
            question: 'Complete the question: "____ ti piace l\'Italia?"',
            options: ["Come", "Perché", "Dove", "Quando"],
            correctAnswer: "Perché",
            hint: 'This word means "why"',
          },
        ],
      },
    ],
  },
];

// Create the provider component
export const LearningProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize state from localStorage if available
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("italian-learning-data");
      return saved ? JSON.parse(saved) : initialItalianData;
    }
    return initialItalianData;
  });

  const [currentChapter, setCurrentChapterState] = useState<Chapter | null>(
    null
  );
  const [currentLesson, setCurrentLessonState] = useState<Lesson | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLessonActive, setIsLessonActive] = useState(false);

  const [streak, setStreak] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("italian-streak") || "0", 10);
    }
    return 0;
  });

  const [xp, setXp] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("italian-xp") || "0", 10);
    }
    return 0;
  });

  const [hearts, setHearts] = useState(5);

  // Calculate overall progress
  const calculateProgress = (): number => {
    const totalLessons = chapters.reduce(
      (acc, chapter) => acc + chapter.lessons.length,
      0
    );
    const completedLessons = chapters.reduce(
      (acc, chapter) =>
        acc + chapter.lessons.filter((lesson) => lesson.completed).length,
      0
    );

    return totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
  };

  const [progress, setProgress] = useState(calculateProgress());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("italian-learning-data", JSON.stringify(chapters));
      localStorage.setItem("italian-streak", streak.toString());
      localStorage.setItem("italian-xp", xp.toString());
      setProgress(calculateProgress());
    }
  }, [chapters, streak, xp]);

  // Find a chapter by ID
  const findChapter = (chapterId: string): Chapter | undefined => {
    return chapters.find((chapter) => chapter.id === chapterId);
  };

  // Find a lesson by ID
  const findLesson = (
    lessonId: string
  ): { lesson: Lesson | undefined; chapter: Chapter | undefined } => {
    for (const chapter of chapters) {
      const lesson = chapter.lessons.find((lesson) => lesson.id === lessonId);
      if (lesson) {
        return { lesson, chapter };
      }
    }
    return { lesson: undefined, chapter: undefined };
  };

  // Set the current chapter
  const setCurrentChapter = (chapterId: string) => {
    const chapter = findChapter(chapterId);
    if (chapter) {
      setCurrentChapterState(chapter);
    }
  };

  // Set the current lesson
  const setCurrentLesson = (lessonId: string) => {
    const { lesson, chapter } = findLesson(lessonId);
    if (lesson && chapter) {
      setCurrentLessonState(lesson);
      setCurrentChapterState(chapter);
    }
  };

  // Start a lesson
  const startLesson = (lessonId: string) => {
    const { lesson, chapter } = findLesson(lessonId);
    if (lesson && chapter && !lesson.locked) {
      setCurrentLessonState(lesson);
      setCurrentChapterState(chapter);
      setCurrentExerciseIndex(0);
      setIsLessonActive(true);
    }
  };

  // Complete the current exercise
  const completeExercise = (correct: boolean) => {
    if (correct) {
      setXp((prev) => prev + 5);
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
    }

    // Move to the next exercise if there are more
    if (
      currentLesson &&
      currentExerciseIndex < currentLesson.exercises.length - 1
    ) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  // Go to the next exercise
  const nextExercise = () => {
    if (
      currentLesson &&
      currentExerciseIndex < currentLesson.exercises.length - 1
    ) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  // Complete the current lesson
  const completeLesson = () => {
    if (currentLesson && currentChapter) {
      // Update lesson completed status
      setChapters((prevChapters) => {
        return prevChapters.map((chapter) => {
          if (chapter.id === currentChapter.id) {
            const updatedLessons = chapter.lessons.map((lesson) => {
              if (lesson.id === currentLesson.id) {
                return { ...lesson, completed: true };
              }

              // Unlock the next lesson if this one is completed
              const currentIndex = chapter.lessons.findIndex(
                (l) => l.id === currentLesson.id
              );
              if (
                currentIndex !== -1 &&
                currentIndex + 1 < chapter.lessons.length &&
                lesson.id === chapter.lessons[currentIndex + 1].id
              ) {
                return { ...lesson, locked: false };
              }

              return lesson;
            });

            // Check if all lessons in chapter are completed
            const allCompleted = updatedLessons.every(
              (lesson) => lesson.completed
            );

            return {
              ...chapter,
              lessons: updatedLessons,
              completed: allCompleted,
            };
          }
          return chapter;
        });
      });

      // Add XP and update streak
      setXp((prev) => prev + 10);
      setStreak((prev) => prev + 1);
      setIsLessonActive(false);
    }
  };

  // Reset the current lesson
  const resetLesson = () => {
    setCurrentExerciseIndex(0);
    setIsLessonActive(false);
  };

  const value = {
    chapters,
    currentChapter,
    currentLesson,
    currentExerciseIndex,
    progress,
    streak,
    xp,
    hearts,
    isLessonActive,
    setCurrentChapter,
    setCurrentLesson,
    startLesson,
    completeExercise,
    completeLesson,
    resetLesson,
    nextExercise,
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};

// Custom hook for using the context
export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
};
