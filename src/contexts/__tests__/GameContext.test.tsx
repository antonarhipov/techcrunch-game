/**
 * Integration tests for Game Context
 * Tasks 5.1.15, 5.3.15
 * @jest-environment jsdom
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { GameProvider, useGame } from "../GameContext";
import * as storage from "@/lib/storage";
import { createInitialMeterState } from "@/lib/meter-engine";
import type { StepResult } from "@/types/game";

// Mock the storage module
jest.mock("@/lib/storage");
const mockedStorage = storage as jest.Mocked<typeof storage>;

// Mock the pack manager
jest.mock("@/lib/pack-manager", () => ({
  getPackManager: jest.fn(() => ({
    getActivePackOrDefault: jest.fn().mockResolvedValue({
      id: "test-pack",
      version: "1.0.0",
      title: "Test Pack",
      steps: [
        {
          id: 1,
          title: "Step 1",
          scenario: "Test scenario",
          optionA: { label: "A", body: "Option A", delta: { R: 5, U: 0, S: 0, C: 0, I: 0 } },
          optionB: { label: "B", body: "Option B", delta: { R: 0, U: 5, S: 0, C: 0, I: 0 } },
        },
        {
          id: 2,
          title: "Step 2",
          scenario: "Test scenario 2",
          optionA: { label: "A", body: "Option A", delta: { R: 5, U: 0, S: 0, C: 0, I: 0 } },
          optionB: { label: "B", body: "Option B", delta: { R: 0, U: 5, S: 0, C: 0, I: 0 } },
        },
        {
          id: 3,
          title: "Step 3",
          scenario: "Test scenario 3",
          optionA: { label: "A", body: "Option A", delta: { R: 5, U: 0, S: 0, C: 0, I: 0 } },
          optionB: { label: "B", body: "Option B", delta: { R: 0, U: 5, S: 0, C: 0, I: 0 } },
        },
        {
          id: 4,
          title: "Step 4",
          scenario: "Test scenario 4",
          optionA: { label: "A", body: "Option A", delta: { R: 5, U: 0, S: 0, C: 0, I: 0 } },
          optionB: { label: "B", body: "Option B", delta: { R: 0, U: 5, S: 0, C: 0, I: 0 } },
        },
        {
          id: 5,
          title: "Step 5",
          scenario: "Test scenario 5",
          optionA: { label: "A", body: "Option A", delta: { R: 5, U: 0, S: 0, C: 0, I: 0 } },
          optionB: { label: "B", body: "Option B", delta: { R: 0, U: 5, S: 0, C: 0, I: 0 } },
        },
      ],
      author: "Test Author",
      description: "Test description",
      metadata: {},
    }),
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockedStorage.isLocalStorageAvailable.mockReturnValue(true);
  mockedStorage.loadRunState.mockReturnValue(null);
  mockedStorage.saveRunState.mockImplementation(() => {});
  mockedStorage.clearRunState.mockImplementation(() => {});
});

describe("GameContext Integration Tests", () => {
  describe("Provider Setup", () => {
    it("should provide context to children", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toBeDefined();
      expect(result.current.runState).toBeNull();
      expect(result.current.contentPack).toBeDefined();
    });

    it("should throw error when useGame is used outside provider", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useGame());
      }).toThrow("useGame must be used within a GameProvider");

      consoleErrorSpy.mockRestore();
    });

    it("should load content pack on mount", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.contentPack).not.toBeNull();
      expect(result.current.contentPack?.id).toBe("test-pack");
    });
  });

  describe("Start New Run", () => {
    it("should create new run with generated seed", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun();
      });

      expect(result.current.runState).not.toBeNull();
      expect(result.current.runState?.seed).toBeDefined();
      expect(result.current.runState?.currentStep).toBe(1);
      expect(result.current.runState?.stepHistory).toEqual([]);
      expect(result.current.runState?.startTime).toBeDefined();
    });

    it("should create new run with provided seed", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      expect(result.current.runState?.seed).toBe(12345);
    });

    it("should clear existing saved state before starting", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun();
      });

      expect(mockedStorage.clearRunState).toHaveBeenCalled();
    });

    it("should save new run to localStorage", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      expect(mockedStorage.saveRunState).toHaveBeenCalledWith(
        expect.objectContaining({
          seed: 12345,
          currentStep: 1,
          stepHistory: [],
        })
      );
    });
  });

  describe("Record Step Result", () => {
    it("should append result to step history", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      const stepResult: StepResult = {
        stepId: 1,
        choiceMade: "A",
        timestamp: new Date().toISOString(),
        deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      };

      const newMeterState = createInitialMeterState();

      act(() => {
        result.current.recordStepResult(stepResult, newMeterState);
      });

      expect(result.current.runState?.stepHistory).toHaveLength(1);
      expect(result.current.runState?.stepHistory[0]).toEqual(stepResult);
    });

    it("should update meter state", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      const stepResult: StepResult = {
        stepId: 1,
        choiceMade: "A",
        timestamp: new Date().toISOString(),
        deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      };

      const newMeterState = createInitialMeterState();
      newMeterState.displayValue = 50;

      act(() => {
        result.current.recordStepResult(stepResult, newMeterState);
      });

      expect(result.current.runState?.meterState.displayValue).toBe(50);
    });

    it("should increment current step", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      const stepResult: StepResult = {
        stepId: 1,
        choiceMade: "A",
        timestamp: new Date().toISOString(),
        deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      };

      act(() => {
        result.current.recordStepResult(stepResult, createInitialMeterState());
      });

      expect(result.current.runState?.currentStep).toBe(2);
    });

    it("should save state after recording", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      jest.clearAllMocks();

      const stepResult: StepResult = {
        stepId: 1,
        choiceMade: "A",
        timestamp: new Date().toISOString(),
        deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      };

      act(() => {
        result.current.recordStepResult(stepResult, createInitialMeterState());
      });

      expect(mockedStorage.saveRunState).toHaveBeenCalled();
    });

    it("should set endTime when game is complete", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      // Record 5 steps to complete the game
      for (let i = 1; i <= 5; i++) {
        const stepResult: StepResult = {
          stepId: i,
          choiceMade: "A",
          timestamp: new Date().toISOString(),
          deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
          unluckTriggered: false,
        };

        act(() => {
          result.current.recordStepResult(stepResult, createInitialMeterState());
        });
      }

      expect(result.current.runState?.endTime).toBeDefined();
      expect(result.current.runState?.currentStep).toBe(6);
    });

    it("should not record when no active run", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const stepResult: StepResult = {
        stepId: 1,
        choiceMade: "A",
        timestamp: new Date().toISOString(),
        deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      };

      act(() => {
        result.current.recordStepResult(stepResult, createInitialMeterState());
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("no active run")
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Load Saved Run", () => {
    it("should load saved run from localStorage", async () => {
      const savedState = {
        seed: 54321,
        currentStep: 3,
        stepHistory: [
          {
            stepId: 1,
            choiceMade: "A" as const,
            timestamp: "2025-01-01T00:00:00.000Z",
            deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
            unluckTriggered: false,
          },
          {
            stepId: 2,
            choiceMade: "B" as const,
            timestamp: "2025-01-01T00:01:00.000Z",
            deltasApplied: { R: 0, U: 5, S: 0, C: 0, I: 0 },
            unluckTriggered: false,
          },
        ],
        meterState: createInitialMeterState(),
        startTime: "2025-01-01T00:00:00.000Z",
      };

      mockedStorage.loadRunState.mockReturnValue(savedState);

      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      act(() => {
        success = result.current.loadSavedRun();
      });

      expect(success).toBe(true);
      expect(result.current.runState?.seed).toBe(54321);
      expect(result.current.runState?.currentStep).toBe(3);
      expect(result.current.runState?.stepHistory).toHaveLength(2);
    });

    it("should return false when no saved run exists", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      mockedStorage.loadRunState.mockReturnValue(null);

      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      act(() => {
        success = result.current.loadSavedRun();
      });

      expect(success).toBe(false);
      expect(result.current.runState).toBeNull();

      consoleWarnSpy.mockRestore();
    });
  });

  describe("Reset Run", () => {
    it("should clear localStorage and reset state", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.startNewRun(12345);
      });

      expect(result.current.runState).not.toBeNull();

      act(() => {
        result.current.resetRun();
      });

      expect(result.current.runState).toBeNull();
      expect(mockedStorage.clearRunState).toHaveBeenCalled();
    });
  });

  describe("Has Saved Run", () => {
    it("should return true when saved run exists", async () => {
      mockedStorage.loadRunState.mockReturnValue({
        seed: 12345,
        currentStep: 1,
        stepHistory: [],
        meterState: createInitialMeterState(),
        startTime: "2025-01-01T00:00:00.000Z",
      });

      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasSavedRun()).toBe(true);
    });

    it("should return false when no saved run exists", async () => {
      mockedStorage.loadRunState.mockReturnValue(null);

      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasSavedRun()).toBe(false);
    });
  });

  describe("Complete Session Cycle", () => {
    it("should handle start -> record -> save -> load cycle", async () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => <GameProvider>{children}</GameProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start new run
      act(() => {
        result.current.startNewRun(99999);
      });

      expect(result.current.runState?.seed).toBe(99999);
      expect(result.current.runState?.currentStep).toBe(1);

      // Record step
      const stepResult: StepResult = {
        stepId: 1,
        choiceMade: "A",
        timestamp: new Date().toISOString(),
        deltasApplied: { R: 5, U: 0, S: 0, C: 0, I: 0 },
        unluckTriggered: false,
      };

      act(() => {
        result.current.recordStepResult(stepResult, createInitialMeterState());
      });

      expect(result.current.runState?.currentStep).toBe(2);
      expect(result.current.runState?.stepHistory).toHaveLength(1);

      // Simulate saving and reloading
      const savedState = result.current.runState;
      mockedStorage.loadRunState.mockReturnValue(savedState);

      act(() => {
        result.current.resetRun();
      });

      expect(result.current.runState).toBeNull();

      act(() => {
        result.current.loadSavedRun();
      });

      expect(result.current.runState?.seed).toBe(99999);
      expect(result.current.runState?.currentStep).toBe(2);
      expect(result.current.runState?.stepHistory).toHaveLength(1);
    });
  });
});

