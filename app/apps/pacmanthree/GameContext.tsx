// app/apps/pacman/GameContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { PacmanGameState } from "./types";

interface GameContextProps {
  gameState: PacmanGameState;
  updateGameState: (newState: Partial<PacmanGameState>) => void;
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
}

const defaultGameState: PacmanGameState = {
  isPlaying: false,
  score: 0,
  lives: 3,
  level: 1,
  gameOver: false,
};

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameState, setGameState] = useState<PacmanGameState>(defaultGameState);

  const updateGameState = (newState: Partial<PacmanGameState>) => {
    setGameState((prevState) => ({ ...prevState, ...newState }));
  };

  const resetGame = () => {
    setGameState(defaultGameState);
  };

  const pauseGame = () => {
    updateGameState({ isPlaying: false });
  };

  const resumeGame = () => {
    updateGameState({ isPlaying: true });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        updateGameState,
        resetGame,
        pauseGame,
        resumeGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextProps => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
