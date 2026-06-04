import { describe, expect, it } from "vitest";
import { toolDefinitions } from "../../data/tools";
import {
  getPractitionerToolDefinition,
  practitionerToolDefinitions,
  practitionerToolSlugs,
} from "./definitions";
import { answerValues } from "./types";

describe("practitioner tool definitions", () => {
  it("defines exactly five new practitioner tools", () => {
    expect(practitionerToolDefinitions).toHaveLength(5);
    expect(practitionerToolSlugs).toEqual([
      "data-product-contract-builder",
      "access-model-simulator",
      "lakehouse-table-layout-advisor",
      "power-bi-semantic-model-doctor",
      "pipeline-recovery-planner",
    ]);
  });

  it("keeps practitioner tools synchronized with the public tool catalog", () => {
    for (const definition of practitionerToolDefinitions) {
      const catalogEntry = toolDefinitions[definition.slug as keyof typeof toolDefinitions];
      expect(catalogEntry).toBeDefined();
      expect(catalogEntry.title).toBe(definition.title);
      expect(catalogEntry.status).toBe("New");
    }
  });

  it("keeps every tool definition complete and route-safe", () => {
    const slugs = practitionerToolDefinitions.map((definition) => definition.slug);

    expect(new Set(slugs).size).toBe(practitionerToolDefinitions.length);
    for (const definition of practitionerToolDefinitions) {
      expect(definition.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(definition.description.length).toBeGreaterThan(80);
      expect(definition.blogSync.href).toMatch(/^\/blog\/[a-z0-9-]+$/);
      expect(definition.serviceCta.href).toBe("/services");
      expect(definition.tiers[definition.tiers.length - 1].minScore).toBe(0);
      expect(definition.strongResultActions.length).toBeGreaterThanOrEqual(3);
      expect(definition.questions).toHaveLength(6);
    }
  });

  it("defines valid question options and action maps", () => {
    for (const definition of practitionerToolDefinitions) {
      const questionIds = definition.questions.map((question) => question.id);
      expect(new Set(questionIds).size).toBe(definition.questions.length);

      for (const question of definition.questions) {
        expect(question.prompt).toContain("?");
        expect(question.helpText.length).toBeGreaterThan(40);
        expect(question.options.map((option) => option.value)).toEqual(answerValues);
        for (const value of answerValues) {
          expect(question.actions[value].length).toBeGreaterThan(40);
        }
      }
    }
  });

  it("returns a definition by slug and undefined for unknown slugs", () => {
    expect(getPractitionerToolDefinition("access-model-simulator")?.title).toBe(
      "Access Model Simulator",
    );
    expect(getPractitionerToolDefinition("unknown-tool")).toBeUndefined();
  });
});
