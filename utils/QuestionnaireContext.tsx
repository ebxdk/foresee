import React, { createContext, ReactNode, useContext, useState } from 'react';

interface QuestionnaireContextType {
  answers: string[];
  setAnswer: (questionIndex: number, answer: string) => void;
  clearAnswers: () => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));

  const setAnswer = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const clearAnswers = () => {
    setAnswers(new Array(10).fill(''));
  };

  return (
    <QuestionnaireContext.Provider value={{ answers, setAnswer, clearAnswers }}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
} 