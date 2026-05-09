import { describe, it, expect } from "vitest";
import {
  engagementTypes,
  processSteps,
  fitSignals,
  antiSignals,
} from "./services";

describe("services", () => {
  describe("engagementTypes", () => {
    it("exports non-empty array", () => {
      expect(engagementTypes.length).toBeGreaterThan(0);
    });

    it("all entries have required fields", () => {
      for (const engagement of engagementTypes) {
        expect(engagement.id).toBeTruthy();
        expect(engagement.title).toBeTruthy();
        expect(engagement.duration).toBeTruthy();
        expect(engagement.description).toBeTruthy();
        expect(engagement.deliverables.length).toBeGreaterThan(0);
        expect(engagement.stack).toBeTruthy();
      }
    });

    it("has unique ids", () => {
      const ids = engagementTypes.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("processSteps", () => {
    it("exports three steps", () => {
      expect(processSteps).toHaveLength(3);
    });

    it("all steps have required fields", () => {
      for (const step of processSteps) {
        expect(step.label).toBeTruthy();
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
      }
    });

    it("steps are in order", () => {
      expect(processSteps[0].label).toBe("01");
      expect(processSteps[1].label).toBe("02");
      expect(processSteps[2].label).toBe("03");
    });
  });

  describe("fitSignals", () => {
    it("exports non-empty array", () => {
      expect(fitSignals.length).toBeGreaterThan(0);
    });

    it("all signals are non-empty strings", () => {
      for (const signal of fitSignals) {
        expect(signal.length).toBeGreaterThan(0);
      }
    });
  });

  describe("antiSignals", () => {
    it("exports non-empty array", () => {
      expect(antiSignals.length).toBeGreaterThan(0);
    });

    it("all signals are non-empty strings", () => {
      for (const signal of antiSignals) {
        expect(signal.length).toBeGreaterThan(0);
      }
    });
  });
});
