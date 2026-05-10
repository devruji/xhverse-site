import { describe, expect, it } from "vitest";
import {
  transformationTypes,
  transformations,
  type TransformationType,
} from "./transformations";

describe("transformationTypes", () => {
  it("contains all eight transformation types", () => {
    expect(transformationTypes).toHaveLength(8);
    expect(transformationTypes).toContain("source");
    expect(transformationTypes).toContain("filter");
    expect(transformationTypes).toContain("join");
    expect(transformationTypes).toContain("group_by");
    expect(transformationTypes).toContain("window");
    expect(transformationTypes).toContain("repartition");
    expect(transformationTypes).toContain("cache");
    expect(transformationTypes).toContain("write");
  });
});

describe("transformations", () => {
  it("has a definition for every transformation type", () => {
    for (const type of transformationTypes) {
      expect(transformations[type]).toBeDefined();
      expect(transformations[type].id).toBe(type);
    }
  });

  it("every definition has a non-empty label and description", () => {
    for (const type of transformationTypes) {
      const def = transformations[type];
      expect(def.label.length).toBeGreaterThan(0);
      expect(def.description.length).toBeGreaterThan(0);
    }
  });

  describe("causesShuffle", () => {
    const shuffleTransformations: TransformationType[] = [
      "join",
      "group_by",
      "window",
      "repartition",
    ];
    const noShuffleTransformations: TransformationType[] = [
      "source",
      "filter",
      "cache",
      "write",
    ];

    it("is true for join, group_by, window, repartition", () => {
      for (const type of shuffleTransformations) {
        expect(transformations[type].causesShuffle).toBe(true);
      }
    });

    it("is false for source, filter, cache, write", () => {
      for (const type of noShuffleTransformations) {
        expect(transformations[type].causesShuffle).toBe(false);
      }
    });
  });

  describe("narrowOrWide", () => {
    it("wide transformations cause shuffle", () => {
      for (const type of transformationTypes) {
        const def = transformations[type];
        if (def.narrowOrWide === "wide") {
          expect(def.causesShuffle).toBe(true);
        }
      }
    });

    it("narrow transformations do not cause shuffle", () => {
      for (const type of transformationTypes) {
        const def = transformations[type];
        if (def.narrowOrWide === "narrow") {
          expect(def.causesShuffle).toBe(false);
        }
      }
    });

    it("causesShuffle and narrowOrWide are consistent for all types", () => {
      for (const type of transformationTypes) {
        const def = transformations[type];
        if (def.causesShuffle) {
          expect(def.narrowOrWide).toBe("wide");
        } else {
          expect(def.narrowOrWide).toBe("narrow");
        }
      }
    });
  });
});
