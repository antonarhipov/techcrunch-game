"use client";

/**
 * Game Context and State Management
 * Provides global game state and actions
 * Tasks: 5.1.1 - 5.1.14
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { RunState, StepResult, MeterState, ContentPack } from "@/types/game";
import { createInitialMeterState } from "@/lib/meter-engine";
import { saveRunState, loadRunState, clearRunState } from "@/lib/storage";
import { getPackManager } from "@/lib/pack-manager";

/**
 * Game Context Value
 */
export interface GameContextValue {
  /** Current run state (null if no active run) */
  runState: RunState | null;
  
  /** Currently loaded content pack */
  contentPack: ContentPack | null;
  
  /** Whether the game is loading */
  isLoading: boolean;
  
  /** Start a new run with optional seed */
  startNewRun: (seed?: number) => void;
  
  /** Record a step result and update state */
  recordStepResult: (result: StepResult, newMeterState: MeterState) => void;
  
  /** Load saved run from localStorage */
  loadSavedRun: () => boolean;
  
  /** Reset the current run */
  resetRun: () => void;
  
  /** Check if there's a saved run available */
  hasSavedRun: () => boolean;
}

/**
 * Game Context
 */
const GameContext = createContext<GameContextValue | null>(null);

/**
 * Game Provider Props
 */
interface GameProviderProps {
  children: ReactNode;
}

/**
 * Game Provider Component
 * Manages game state and provides context to children
 */
export function GameProvider({ children }: GameProviderProps): React.ReactElement {
  const [runState, setRunState] = useState<RunState | null>(null);
  const [contentPack, setContentPack] = useState<ContentPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load content pack on mount
   */
  useEffect(() => {
    async function loadPack() {
      try {
        const packManager = getPackManager();
        const pack = await packManager.getActivePackOrDefault();
        setContentPack(pack);
      } catch (error) {
        console.error("Failed to load content pack:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPack();
  }, []);

  /**
   * Start a new run
   * Clears existing state and creates fresh run
   */
  const startNewRun = useCallback((seed?: number) => {
    if (!contentPack) {
      console.error("Cannot start new run: content pack not loaded");
      return;
    }

    // Generate seed if not provided
    const runSeed = seed ?? Date.now();
    
    // Clear any existing saved state
    clearRunState();
    
    // Create initial state
    const initialState: RunState = {
      seed: runSeed,
      currentStep: 1,
      stepHistory: [],
      meterState: createInitialMeterState(),
      startTime: new Date().toISOString(),
      endTime: undefined,
      contentPackId: contentPack.id,
    };
    
    setRunState(initialState);
    saveRunState(initialState);
  }, [contentPack]);

  /**
   * Record a step result
   * Appends to history, updates meter, increments step
   */
  const recordStepResult = useCallback(
    (result: StepResult, newMeterState: MeterState) => {
      if (!runState) {
        console.error("Cannot record step result: no active run");
        return;
      }

      const updatedState: RunState = {
        ...runState,
        stepHistory: [...runState.stepHistory, result],
        meterState: newMeterState,
        currentStep: runState.currentStep + 1,
      };

      // Check if game is complete
      if (updatedState.currentStep > 5) {
        updatedState.endTime = new Date().toISOString();
      }

      setRunState(updatedState);
      saveRunState(updatedState);
    },
    [runState]
  );

  /**
   * Load saved run from localStorage
   * Returns true if successful, false otherwise
   */
  const loadSavedRun = useCallback((): boolean => {
    const savedState = loadRunState();
    
    if (!savedState) {
      console.warn("No saved run found");
      return false;
    }

    setRunState(savedState);
    return true;
  }, []);

  /**
   * Reset the current run
   * Clears state and localStorage
   */
  const resetRun = useCallback(() => {
    clearRunState();
    setRunState(null);
  }, []);

  /**
   * Check if there's a saved run available
   */
  const hasSavedRun = useCallback((): boolean => {
    const savedState = loadRunState();
    return savedState !== null;
  }, []);

  const contextValue: GameContextValue = {
    runState,
    contentPack,
    isLoading,
    startNewRun,
    recordStepResult,
    loadSavedRun,
    resetRun,
    hasSavedRun,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Custom hook to use game context
 * Throws error if used outside GameProvider
 */
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  
  return context;
}

