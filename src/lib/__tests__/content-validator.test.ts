/**
 * Unit tests for Content Pack Validator
 * Task 4.1.11
 */

import {
  validateId,
  validateVersion,
  validateDelta,
  validateChoice,
  validateStep,
  validateContentPack,
  formatValidationErrors,
} from "../content-validator";
import { DEFAULT_CONTENT_PACK } from "../default-pack";
import type { ContentPack, Step, Choice, Delta } from "@/types/game";

describe("Content Pack Validator", () => {
  describe("validateId()", () => {
    it("should accept valid IDs", () => {
      expect(validateId("ai-cofounder-v1")).toHaveLength(0);
      expect(validateId("test-pack")).toHaveLength(0);
      expect(validateId("pack123")).toHaveLength(0);
    });

    it("should reject empty ID", () => {
      const errors = validateId("");
      expect(errors.length).toBeGreaterThan(0);
      // Empty string is caught by INVALID_ID check first (before EMPTY_ID check)
      expect(errors.some(e => e.code === "EMPTY_ID" || e.code === "INVALID_ID")).toBe(true);
    });

    it("should reject non-string ID", () => {
      const errors = validateId(null as any);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.code).toBe("INVALID_ID");
    });

    it("should reject ID with invalid characters", () => {
      const errors = validateId("pack_with_underscores!");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.code === "INVALID_ID_FORMAT")).toBe(true);
    });
  });

  describe("validateVersion()", () => {
    it("should accept valid semantic versions", () => {
      expect(validateVersion("1.0.0")).toHaveLength(0);
      expect(validateVersion("2.5.3")).toHaveLength(0);
      expect(validateVersion("10.20.30")).toHaveLength(0);
    });

    it("should reject invalid version format", () => {
      expect(validateVersion("1.0").length).toBeGreaterThan(0);
      expect(validateVersion("v1.0.0").length).toBeGreaterThan(0);
      expect(validateVersion("1.0.0-beta").length).toBeGreaterThan(0);
    });

    it("should reject non-string version", () => {
      const errors = validateVersion(null as any);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateDelta()", () => {
    it("should accept valid deltas", () => {
      const delta: Delta = { R: 10, U: 5, S: -3, C: 8, I: -2 };
      expect(validateDelta(delta)).toHaveLength(0);
    });

    it("should accept boundary values", () => {
      const delta: Delta = { R: 15, U: -10, S: 0, C: 15, I: -10 };
      expect(validateDelta(delta)).toHaveLength(0);
    });

    it("should reject values above +15", () => {
      const delta: Delta = { R: 20, U: 5, S: 0, C: 0, I: 0 };
      const errors = validateDelta(delta);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.code === "DELTA_OUT_OF_RANGE")).toBe(true);
    });

    it("should reject values below -10", () => {
      const delta: Delta = { R: 0, U: -15, S: 0, C: 0, I: 0 };
      const errors = validateDelta(delta);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject non-number values", () => {
      const delta = { R: "5" as any, U: 5, S: 0, C: 0, I: 0 };
      const errors = validateDelta(delta);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject null delta", () => {
      const errors = validateDelta(null as any);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateChoice()", () => {
    const validChoice: Choice = {
      label: "Valid Choice",
      body: "This is a valid choice description",
      delta: { R: 10, U: 5, S: 0, C: 0, I: -2 },
    };

    it("should accept valid choice", () => {
      expect(validateChoice(validChoice, 1, "A")).toHaveLength(0);
    });

    it("should reject missing label", () => {
      const choice = { ...validChoice, label: "" };
      const errors = validateChoice(choice, 1, "A");
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject label over 200 characters", () => {
      const choice = { ...validChoice, label: "x".repeat(201) };
      const errors = validateChoice(choice, 1, "A");
      expect(errors.some(e => e.code === "LABEL_TOO_LONG")).toBe(true);
    });

    it("should reject missing body", () => {
      const choice = { ...validChoice, body: "" };
      const errors = validateChoice(choice, 1, "A");
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject body over 1000 characters", () => {
      const choice = { ...validChoice, body: "x".repeat(1001) };
      const errors = validateChoice(choice, 1, "A");
      expect(errors.some(e => e.code === "BODY_TOO_LONG")).toBe(true);
    });

    it("should validate delta", () => {
      const choice = {
        ...validChoice,
        delta: { R: 100, U: 0, S: 0, C: 0, I: 0 },
      };
      const errors = validateChoice(choice, 1, "A");
      expect(errors.some(e => e.code === "DELTA_OUT_OF_RANGE")).toBe(true);
    });
  });

  describe("validateStep()", () => {
    const validStep: Step = {
      id: 1,
      title: "Valid Step",
      scenario: "This is a valid scenario",
      optionA: {
        label: "Option A",
        body: "Description for option A",
        delta: { R: 10, U: 5, S: 0, C: 0, I: -2 },
      },
      optionB: {
        label: "Option B",
        body: "Description for option B",
        delta: { R: -3, U: 0, S: 0, C: 8, I: 5 },
      },
    };

    it("should accept valid step", () => {
      expect(validateStep(validStep)).toHaveLength(0);
    });

    it("should reject step ID out of range", () => {
      const step = { ...validStep, id: 10 };
      const errors = validateStep(step);
      expect(errors.some(e => e.code === "STEP_ID_OUT_OF_RANGE")).toBe(true);
    });

    it("should reject missing title", () => {
      const step = { ...validStep, title: "" };
      const errors = validateStep(step);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject missing scenario", () => {
      const step = { ...validStep, scenario: "" };
      const errors = validateStep(step);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should validate both options", () => {
      const step = {
        ...validStep,
        optionA: {
          ...validStep.optionA,
          delta: { R: 100, U: 0, S: 0, C: 0, I: 0 },
        },
      };
      const errors = validateStep(step);
      expect(errors.some(e => e.path.includes("optionA"))).toBe(true);
    });
  });

  describe("validateContentPack()", () => {
    it("should accept default content pack", () => {
      const result = validateContentPack(DEFAULT_CONTENT_PACK);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject pack with wrong number of steps", () => {
      const pack: ContentPack = {
        ...DEFAULT_CONTENT_PACK,
        steps: DEFAULT_CONTENT_PACK.steps.slice(0, 3),
      };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === "WRONG_STEP_COUNT")).toBe(true);
    });

    it("should reject pack with non-sequential step IDs", () => {
      const pack: ContentPack = {
        ...DEFAULT_CONTENT_PACK,
        steps: DEFAULT_CONTENT_PACK.steps.map((step, i) => ({
          ...step,
          id: i + 2, // Start from 2 instead of 1
        })),
      };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === "NON_SEQUENTIAL_STEPS")).toBe(true);
    });

    it("should reject pack without ID", () => {
      const pack = { ...DEFAULT_CONTENT_PACK, id: "" };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(false);
    });

    it("should reject pack without version", () => {
      const pack = { ...DEFAULT_CONTENT_PACK, version: "invalid" };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(false);
    });

    it("should reject pack without title", () => {
      const pack = { ...DEFAULT_CONTENT_PACK, title: "" };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(false);
    });

    it("should reject pack with invalid steps array", () => {
      const pack = { ...DEFAULT_CONTENT_PACK, steps: "not an array" as any };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === "INVALID_STEPS")).toBe(true);
    });

    it("should reject null pack", () => {
      const result = validateContentPack(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.code).toBe("INVALID_PACK");
    });
  });

  describe("formatValidationErrors()", () => {
    it("should format successful validation", () => {
      const result = { valid: true, errors: [] };
      const formatted = formatValidationErrors(result);
      expect(formatted).toContain("valid");
    });

    it("should format validation errors", () => {
      const result = {
        valid: false,
        errors: [
          {
            message: "ID is required",
            path: "id",
            code: "MISSING_ID",
          },
          {
            message: "Version is invalid",
            path: "version",
            code: "INVALID_VERSION",
          },
        ],
      };
      const formatted = formatValidationErrors(result);
      expect(formatted).toContain("MISSING_ID");
      expect(formatted).toContain("INVALID_VERSION");
      expect(formatted).toContain("ID is required");
    });
  });

  describe("Edge Cases", () => {
    it("should handle pack with optional fields", () => {
      const pack: ContentPack = {
        ...DEFAULT_CONTENT_PACK,
        description: "Optional description",
        author: "Test Author",
        metadata: { theme: "test" },
      };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(true);
    });

    it("should handle step with optional subtitle", () => {
      const pack: ContentPack = {
        ...DEFAULT_CONTENT_PACK,
        steps: DEFAULT_CONTENT_PACK.steps.map(step => ({
          ...step,
          subtitle: "Optional subtitle",
        })),
      };
      const result = validateContentPack(pack);
      expect(result.valid).toBe(true);
    });
  });
});

