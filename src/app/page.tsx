"use client";

/**
 * Main Game Page
 * Orchestrates game flow and screen transitions
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useGame } from "@/contexts/GameContext";
import { getFeatureFlags } from "@/lib/feature-flags";
import { processStepChoice } from "@/lib/game-flow";
import { calculateEnding } from "@/lib/endings";
import { generateAlternatePathHints } from "@/lib/replay";
import { getConsoleScript } from "@/lib/console-scripts";

// Components
import { StartScreen } from "@/components/StartScreen";
import { EndingScreen } from "@/components/EndingScreen";
import { GameLayout } from "@/components/GameLayout";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { JunieConsole } from "@/components/JunieConsole";
import { ScalingMeter } from "@/components/ScalingMeter";
import { UnluckPopup } from "@/components/UnluckPopup";
import { VideoModal } from "@/components/VideoModal";

import type { UnluckResult, LogEntry } from "@/types/game";

type GameScreen = "start" | "playing" | "video" | "feedback" | "ending";

export default function Home() {
  const { runState, contentPack, isLoading, recordStepResult } = useGame();
  const [screen, setScreen] = useState<GameScreen>("start");
  const [pendingChoice, setPendingChoice] = useState<"A" | "B" | null>(null);
  const [unluckResult, setUnluckResult] = useState<UnluckResult | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [previousMeterValue, setPreviousMeterValue] = useState<number | undefined>(undefined);
  const [showFinishButton, setShowFinishButton] = useState(false);

  // Memoize feature flags to avoid recalculating on every render
  const featureFlags = useMemo(() => getFeatureFlags(), []);

  // Memoize ending calculations at top level (only calculated when needed)
  const ending = useMemo(
    () => runState && runState.currentStep > 5
      ? calculateEnding(
          runState.meterState.displayValue,
          runState.meterState.hiddenState
        )
      : null,
    [runState?.meterState.displayValue, runState?.meterState.hiddenState, runState?.currentStep]
  );
  
  const hints = useMemo(
    () => runState && contentPack && runState.currentStep > 5
      ? generateAlternatePathHints(runState.stepHistory, contentPack)
      : null,
    [runState?.stepHistory, runState?.currentStep, contentPack]
  );

  // Determine current screen based on runState
  useEffect(() => {
    if (!runState) {
      setScreen("start");
      setShowFinishButton(false);
    } else if (runState.currentStep > 5) {
      // Game is complete - show finish button but stay on playing screen
      // Don't automatically go to ending - wait for user to click button
      if (screen !== "ending") {
        setScreen("playing");
        setShowFinishButton(true);
      }
    } else {
      // Normal gameplay
      setScreen("playing");
      setShowFinishButton(false);
    }
  }, [runState?.currentStep, screen]);

  // Preload assets for next step while current step is active
  useEffect(() => {
    if (runState && contentPack && runState.currentStep < 5) {
      const nextStep = contentPack.steps.find(s => s.id === runState.currentStep + 1);
      if (nextStep?.assets && nextStep.assets.length > 0) {
        // Preload assets in the background
        nextStep.assets.forEach((assetUrl) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = assetUrl;
          document.head.appendChild(link);
        });
      }
    }
  }, [runState?.currentStep, contentPack]);

  /**
   * Handle choice selection
   * Triggers video modal or proceeds directly based on feature flags
   */
  const handleChoiceSelect = useCallback((choice: "A" | "B") => {
    setPendingChoice(choice);
    setPreviousMeterValue(runState?.meterState.displayValue);

    // Skip video if animations are disabled
    if (featureFlags.skipAnimations) {
      processChoice(choice);
    } else {
      setShowVideoModal(true);
    }
  }, [runState, featureFlags.skipAnimations]);

  /**
   * Process the choice and update game state
   */
  const processChoice = useCallback((choice: "A" | "B") => {
    if (!runState || !contentPack) return;

    try {
      // Process step using game flow
      const result = processStepChoice(runState, choice, contentPack, featureFlags);

      // Store unluck result for popup
      if (result.stepResult.unluckApplied) {
        setUnluckResult({
          unluckApplied: true,
          luckFactor: result.stepResult.luckFactor || 1.0,
          message: result.stepResult.unluckApplied 
            ? (result.stepResult.perfectStorm 
              ? "Perfect Storm!"
              : "Bad Luck!")
            : null,
          perfectStorm: result.stepResult.perfectStorm,
        });
      }

      // Get a console script for this step/choice
      const script = getConsoleScript(result.stepResult.stepId, choice);
      
      // Stream console logs, with warnings for unluck/perfect storm when they occur
      const logsToStream: LogEntry[] = [...script.logs];
      if (result.stepResult.unluckApplied) {
        const luckFactor = result.stepResult.luckFactor ?? 1.0;
        const luckPct = Math.round(luckFactor * 100);
        logsToStream.push({
          type: "warning",
          text: `Bad luck event: outcomes were impacted (luck factor ${luckPct}%). Positive gains were reduced and negative effects amplified.`,
        });
        if (result.stepResult.perfectStorm) {
          logsToStream.push({
            type: "warning",
            text: "Perfect Storm: a severe, compounding setback hit multiple systems (Revenue, Users, Customers, Investors).",
          });
        }
      }
      streamConsoleLogs(logsToStream);

      // Record step result
      recordStepResult(result.stepResult, result.newMeterState);

      // Clear pending choice
      setPendingChoice(null);
    } catch (error) {
      console.error("Error processing choice:", error);
    }
  }, [runState, contentPack, featureFlags, recordStepResult]);

  /**
   * Stream console logs with timing
   */
  const streamConsoleLogs = useCallback((logs: LogEntry[]) => {
    setConsoleLogs([]);
    setIsStreaming(true);

    logs.forEach((log, index) => {
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setIsStreaming(false);
        }
      }, index * 400); // 400ms between logs
    });
  }, []);

  /**
   * Handle video completion or close
   */
  const handleVideoComplete = useCallback(() => {
    setShowVideoModal(false);
    if (pendingChoice) {
      processChoice(pendingChoice);
    }
  }, [pendingChoice, processChoice]);

  /**
   * Handle unluck popup close
   */
  const handleUnluckClose = useCallback(() => {
    setUnluckResult(null);
  }, []);

  /**
   * Handle finish game button click (after final step)
   */
  const handleFinishGame = useCallback(() => {
    setScreen("ending");
  }, []);


  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚀</div>
          <p className="text-lg text-gray-300">Loading game...</p>
        </div>
      </div>
    );
  }

  // Start screen
  if (screen === "start") {
    return <StartScreen />;
  }

  // Ending screen
  if (screen === "ending" && runState && ending && hints) {
    return (
      <EndingScreen 
        runState={runState} 
        ending={ending}
        hints={hints}
      />
    );
  }

  // Game screen
  if (screen === "playing" && runState && contentPack) {
    // If game is complete (step > 5) and finish button should be shown
    if (runState.currentStep > 5 && showFinishButton) {
      return (
        <>
          <GameLayout
            scenarioPanel={
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="max-w-2xl w-full text-center space-y-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-white">
                    Journey Complete!
                  </h2>
                  <p className="text-lg text-gray-300">
                    You've made all your decisions. Your AI cofounder has shipped code,
                    faced challenges, and adapted along the way.
                  </p>
                  <p className="text-gray-300">
                    Check the console to see what Junie built, and review your final
                    metrics in the scaling meter.
                  </p>
                  <button
                    type="button"
                    onClick={handleFinishGame}
                    disabled={isStreaming}
                    className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStreaming ? "Processing..." : "See Final Results 🎯"}
                  </button>
                </div>
              </div>
            }
            consolePanel={
              <JunieConsole
                logs={consoleLogs}
                isStreaming={isStreaming}
              />
            }
            meterPanel={
              <ScalingMeter
                meterState={runState.meterState}
                previousValue={previousMeterValue}
                showInsights={true}
              />
            }
          />

          {/* Unluck Popup */}
          {unluckResult && (
            <UnluckPopup
              unluckResult={unluckResult}
              onClose={handleUnluckClose}
            />
          )}
        </>
      );
    }

    // Normal gameplay - show current step
    const currentStep = contentPack.steps.find(s => s.id === runState.currentStep);

    if (!currentStep) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-950">
          <p className="text-red-400">Error: Step not found</p>
        </div>
      );
    }

    return (
      <>
        <GameLayout
          scenarioPanel={
            <ScenarioPanel
              step={currentStep}
              onChoiceSelect={handleChoiceSelect}
              disabled={isStreaming || showVideoModal}
            />
          }
          consolePanel={
            <JunieConsole
              logs={consoleLogs}
              isStreaming={isStreaming}
            />
          }
          meterPanel={
            <ScalingMeter
              meterState={runState.meterState}
              previousValue={previousMeterValue}
              showInsights={true}
            />
          }
        />

        {/* Video Modal */}
        <VideoModal
          isOpen={showVideoModal}
          videoSrc={(pendingChoice === "A" ? currentStep.optionA.video : pendingChoice === "B" ? currentStep.optionB.video : undefined) ?? "/video/clip1.mp4"}
          onClose={handleVideoComplete}
          onComplete={handleVideoComplete}
        />

        {/* Unluck Popup */}
        {unluckResult && (
          <UnluckPopup
            unluckResult={unluckResult}
            onClose={handleUnluckClose}
          />
        )}
      </>
    );
  }

  // Fallback
  return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <p className="text-gray-300">Initializing...</p>
    </div>
  );
}
