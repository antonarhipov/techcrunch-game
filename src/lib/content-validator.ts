/**
 * Content Pack Validation System
 * Validates content pack structure, fields, and constraints
 */

import type { ContentPack, Step, Choice, Delta, ValidationError, ValidationResult } from "@/types/game";

// ============================================================================
// Field Validators
// ============================================================================

/**
 * Validate content pack ID
 * Must be non-empty alphanumeric with hyphens
 */
export function validateId(id: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!id || typeof id !== "string") {
    errors.push({
      message: "ID is required and must be a string",
      path: "id",
      code: "INVALID_ID",
    });
    return errors;
  }

  if (id.trim().length === 0) {
    errors.push({
      message: "ID cannot be empty",
      path: "id",
      code: "EMPTY_ID",
    });
  }

  // Check alphanumeric + hyphens only
  if (!/^[a-z0-9-]+$/i.test(id)) {
    errors.push({
      message: "ID must contain only alphanumeric characters and hyphens",
      path: "id",
      code: "INVALID_ID_FORMAT",
    });
  }

  return errors;
}

/**
 * Validate semantic version string (X.Y.Z)
 */
export function validateVersion(version: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!version || typeof version !== "string") {
    errors.push({
      message: "Version is required and must be a string",
      path: "version",
      code: "INVALID_VERSION",
    });
    return errors;
  }

  // Check semantic versioning format
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    errors.push({
      message: "Version must follow semantic versioning (X.Y.Z)",
      path: "version",
      code: "INVALID_VERSION_FORMAT",
    });
  }

  return errors;
}

/**
 * Validate delta values
 * All values must be in [-10, +15] range
 */
export function validateDelta(delta: Delta, path: string = "delta"): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!delta || typeof delta !== "object") {
    errors.push({
      message: "Delta must be an object",
      path,
      code: "INVALID_DELTA",
    });
    return errors;
  }

  const dimensions = ["R", "U", "S", "C", "I"] as const;
  
  for (const dim of dimensions) {
    const value = delta[dim];
    
    if (typeof value !== "number") {
      errors.push({
        message: `Delta.${dim} must be a number`,
        path: `${path}.${dim}`,
        code: "INVALID_DELTA_VALUE",
      });
      continue;
    }

    if (value < -10 || value > 15) {
      errors.push({
        message: `Delta.${dim} must be in range [-10, +15] (got ${value})`,
        path: `${path}.${dim}`,
        code: "DELTA_OUT_OF_RANGE",
      });
    }
  }

  return errors;
}

/**
 * Validate a choice option
 */
export function validateChoice(
  choice: Choice,
  stepId: number,
  optionLabel: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  const basePath = `step${stepId}.option${optionLabel}`;

  if (!choice || typeof choice !== "object") {
    errors.push({
      message: `Option ${optionLabel} must be an object`,
      path: basePath,
      code: "INVALID_CHOICE",
    });
    return errors;
  }

  // Validate label
  if (!choice.label || typeof choice.label !== "string") {
    errors.push({
      message: "Choice label is required",
      path: `${basePath}.label`,
      code: "MISSING_LABEL",
    });
  } else if (choice.label.length > 200) {
    errors.push({
      message: `Choice label must be ≤200 characters (got ${choice.label.length})`,
      path: `${basePath}.label`,
      code: "LABEL_TOO_LONG",
    });
  }

  // Validate body
  if (!choice.body || typeof choice.body !== "string") {
    errors.push({
      message: "Choice body is required",
      path: `${basePath}.body`,
      code: "MISSING_BODY",
    });
  } else if (choice.body.length > 1000) {
    errors.push({
      message: `Choice body must be ≤1000 characters (got ${choice.body.length})`,
      path: `${basePath}.body`,
      code: "BODY_TOO_LONG",
    });
  }

  // Validate delta
  errors.push(...validateDelta(choice.delta, `${basePath}.delta`));

  return errors;
}

/**
 * Validate a single step
 */
export function validateStep(step: Step): ValidationError[] {
  const errors: ValidationError[] = [];
  const basePath = `step${step.id}`;

  if (!step || typeof step !== "object") {
    errors.push({
      message: "Step must be an object",
      path: basePath,
      code: "INVALID_STEP",
    });
    return errors;
  }

  // Validate ID
  if (typeof step.id !== "number") {
    errors.push({
      message: "Step ID must be a number",
      path: `${basePath}.id`,
      code: "INVALID_STEP_ID",
    });
  } else if (step.id < 1 || step.id > 5) {
    errors.push({
      message: `Step ID must be in range [1, 5] (got ${step.id})`,
      path: `${basePath}.id`,
      code: "STEP_ID_OUT_OF_RANGE",
    });
  }

  // Validate title
  if (!step.title || typeof step.title !== "string") {
    errors.push({
      message: "Step title is required",
      path: `${basePath}.title`,
      code: "MISSING_TITLE",
    });
  } else if (step.title.trim().length === 0) {
    errors.push({
      message: "Step title cannot be empty",
      path: `${basePath}.title`,
      code: "EMPTY_TITLE",
    });
  }

  // Validate scenario
  if (!step.scenario || typeof step.scenario !== "string") {
    errors.push({
      message: "Step scenario is required",
      path: `${basePath}.scenario`,
      code: "MISSING_SCENARIO",
    });
  } else if (step.scenario.trim().length === 0) {
    errors.push({
      message: "Step scenario cannot be empty",
      path: `${basePath}.scenario`,
      code: "EMPTY_SCENARIO",
    });
  }

  // Validate options
  errors.push(...validateChoice(step.optionA, step.id, "A"));
  errors.push(...validateChoice(step.optionB, step.id, "B"));

  return errors;
}

/**
 * Validate complete content pack
 */
export function validateContentPack(pack: ContentPack): ValidationResult {
  const errors: ValidationError[] = [];

  if (!pack || typeof pack !== "object") {
    return {
      valid: false,
      errors: [{
        message: "Content pack must be an object",
        path: "root",
        code: "INVALID_PACK",
      }],
    };
  }

  // Validate required fields
  errors.push(...validateId(pack.id));
  errors.push(...validateVersion(pack.version));

  if (!pack.title || typeof pack.title !== "string") {
    errors.push({
      message: "Title is required",
      path: "title",
      code: "MISSING_TITLE",
    });
  } else if (pack.title.trim().length === 0) {
    errors.push({
      message: "Title cannot be empty",
      path: "title",
      code: "EMPTY_TITLE",
    });
  }

  // Validate steps array
  if (!Array.isArray(pack.steps)) {
    errors.push({
      message: "Steps must be an array",
      path: "steps",
      code: "INVALID_STEPS",
    });
    return { valid: false, errors };
  }

  if (pack.steps.length !== 5) {
    errors.push({
      message: `Pack must have exactly 5 steps (got ${pack.steps.length})`,
      path: "steps",
      code: "WRONG_STEP_COUNT",
    });
  }

  // Validate each step
  for (const step of pack.steps) {
    errors.push(...validateStep(step));
  }

  // Validate step IDs are sequential 1-5
  const stepIds = pack.steps.map(s => s.id).sort((a, b) => a - b);
  const expectedIds = [1, 2, 3, 4, 5];
  
  if (JSON.stringify(stepIds) !== JSON.stringify(expectedIds)) {
    errors.push({
      message: `Step IDs must be sequential [1, 2, 3, 4, 5] (got [${stepIds.join(", ")}])`,
      path: "steps",
      code: "NON_SEQUENTIAL_STEPS",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors into user-friendly message
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) {
    return "Content pack is valid";
  }

  const lines = ["Content pack validation failed:", ""];
  
  for (const error of result.errors) {
    lines.push(`  [${error.code}] ${error.path}: ${error.message}`);
  }

  return lines.join("\n");
}

