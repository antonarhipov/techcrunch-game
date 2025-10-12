/**
 * Replay System - Analyze completed runs and suggest alternate paths
 */

import type { StepResult, ContentPack } from "@/types/game";

/**
 * Analyze the path taken during a run
 * @param stepHistory - Array of completed step results
 * @returns Path string (e.g., "ABABA")
 */
export function analyzePathTaken(stepHistory: StepResult[]): string {
  return stepHistory.map(step => step.choice).join("");
}

/**
 * Calculate impact score for a choice
 * Higher score = more impactful decision
 */
function calculateChoiceImpact(stepResult: StepResult): number {
  // Impact factors:
  // 1. Meter change magnitude
  const meterChange = Math.abs(stepResult.meterAfter - stepResult.meterBefore);
  
  // 2. Tier change (very impactful)
  const tierChanged = stepResult.tierBefore !== stepResult.tierAfter ? 20 : 0;
  
  // 3. Unluck occurrence (adds drama)
  const unluckImpact = stepResult.unluckApplied ? 10 : 0;
  
  // 4. Perfect Storm (massive impact)
  const stormImpact = stepResult.perfectStorm ? 30 : 0;
  
  return meterChange + tierChanged + unluckImpact + stormImpact;
}

/**
 * Estimate what would have happened with alternate choice
 * This is a simplified heuristic—real calculation would require running the game
 */
function estimateAlternateImpact(
  stepResult: StepResult,
  alternateChoice: "A" | "B",
  step: { optionA: { delta: any }, optionB: { delta: any } }
): number {
  const alternateDelta = alternateChoice === "A" ? step.optionA.delta : step.optionB.delta;
  const chosenDelta = stepResult.appliedDelta;
  
  // Simple heuristic: sum of delta differences
  const deltaKeys = ["R", "U", "S", "C", "I"] as const;
  let totalDiff = 0;
  
  for (const key of deltaKeys) {
    const altValue = (alternateDelta as unknown as Record<string, number>)[key as string] ?? 0;
    const chosenValue = (chosenDelta as unknown as Record<string, number>)[key as string] ?? 0;
    const diff = Math.abs(altValue - chosenValue);
    totalDiff += diff;
  }
  
  return totalDiff;
}

/**
 * Generate alternate path hints
 * Suggests 1-2 different choices that could have significantly changed the outcome
 * 
 * @param stepHistory - Completed step results
 * @param contentPack - Content pack used for the run
 * @returns Array of hint strings (max 2)
 */
export function generateAlternatePathHints(
  stepHistory: StepResult[],
  contentPack: ContentPack
): string[] {
  const hints: Array<{ stepId: number; message: string; impact: number }> = [];
  
  for (const stepResult of stepHistory) {
    const step = contentPack.steps.find(s => s.id === stepResult.stepId);
    if (!step) continue;
    
    // Determine alternate choice
    const alternateChoice: "A" | "B" = stepResult.choice === "A" ? "B" : "A";
    const alternateOption = alternateChoice === "A" ? step.optionA : step.optionB;
    
    // Calculate impact of current choice
    const currentImpact = calculateChoiceImpact(stepResult);
    
    // Estimate impact of alternate choice
    const alternateImpact = estimateAlternateImpact(stepResult, alternateChoice, step);
    
    // Only suggest if alternate would have been significantly different
    if (alternateImpact > 5) {
      // Create hint message
      const optionLabel = alternateOption.label;
      const message = `What if you chose Option ${alternateChoice} at Step ${stepResult.stepId}? (${optionLabel})`;
      
      hints.push({
        stepId: stepResult.stepId,
        message,
        impact: currentImpact + alternateImpact,
      });
    }
  }
  
  // Sort by impact and take top 2
  const sortedHints = hints.sort((a, b) => b.impact - a.impact);
  const topHints = sortedHints.slice(0, 2);
  
  // If we have hints, return them
  if (topHints.length > 0) {
    return topHints.map(h => h.message);
  }
  
  // Fallback hints if analysis didn't find anything
  return [
    "Try different choices to see how the story changes!",
    "Every decision matters—experiment with different paths.",
  ];
}

/**
 * Generate summary statistics for a completed run
 * @param stepHistory - Completed step results
 * @returns Run statistics object
 */
export function generateRunStatistics(stepHistory: StepResult[]) {
  const totalSteps = stepHistory.length;
  const unluckCount = stepHistory.filter(s => s.unluckApplied).length;
  const perfectStormCount = stepHistory.filter(s => s.perfectStorm).length;
  const tierChanges = stepHistory.filter((s, i) => {
    if (i === 0) return false;
    return s.tierAfter !== stepHistory[i - 1]?.tierAfter;
  }).length;
  
  const startMeter = stepHistory[0]?.meterBefore ?? 0;
  const endMeter = stepHistory[stepHistory.length - 1]?.meterAfter ?? 0;
  const totalMeterChange = endMeter - startMeter;
  
  return {
    totalSteps,
    unluckCount,
    perfectStormCount,
    tierChanges,
    startMeter,
    endMeter,
    totalMeterChange,
    averageMeterChangePerStep: totalSteps > 0 ? totalMeterChange / totalSteps : 0,
  };
}

/**
 * Compare two runs to show differences
 * Useful for showing "before and after" when replaying
 * 
 * @param run1History - First run's step history
 * @param run2History - Second run's step history
 * @returns Comparison object
 */
export function compareRuns(run1History: StepResult[], run2History: StepResult[]) {
  const path1 = analyzePathTaken(run1History);
  const path2 = analyzePathTaken(run2History);
  
  const stats1 = generateRunStatistics(run1History);
  const stats2 = generateRunStatistics(run2History);
  
  // Find divergence point
  let divergenceStep = -1;
  for (let i = 0; i < Math.min(run1History.length, run2History.length); i++) {
    if (run1History[i]?.choice !== run2History[i]?.choice) {
      divergenceStep = i + 1;
      break;
    }
  }
  
  return {
    path1,
    path2,
    stats1,
    stats2,
    divergenceStep,
    meterDifference: stats2.endMeter - stats1.endMeter,
    pathsIdentical: path1 === path2,
  };
}

