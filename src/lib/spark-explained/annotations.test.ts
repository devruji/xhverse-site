import { describe, expect, it } from "vitest";
import { getAnnotation, type AnnotationContext } from "./annotations";
import { transformationTypes } from "./transformations";

describe("getAnnotation", () => {
  it("returns a valid annotation for every transformation type in normal context", () => {
    for (const type of transformationTypes) {
      const annotation = getAnnotation(type, false, false);
      expect(annotation.transformation).toBe(type);
      expect(annotation.context).toBe("normal");
      expect(annotation.title.length).toBeGreaterThan(0);
      expect(annotation.body.length).toBeGreaterThan(0);
    }
  });

  it("returns skewed context when hasSkew is true and no spill", () => {
    for (const type of transformationTypes) {
      const annotation = getAnnotation(type, true, false);
      expect(annotation.context).toBe("skewed");
      expect(annotation.title.length).toBeGreaterThan(0);
      expect(annotation.body.length).toBeGreaterThan(0);
    }
  });

  it("returns spill context when hasSpill is true", () => {
    for (const type of transformationTypes) {
      const annotation = getAnnotation(type, false, true);
      expect(annotation.context).toBe("spill");
      expect(annotation.title.length).toBeGreaterThan(0);
      expect(annotation.body.length).toBeGreaterThan(0);
    }
  });

  it("spill takes priority over skewed when both are true", () => {
    for (const type of transformationTypes) {
      const annotation = getAnnotation(type, true, true);
      expect(annotation.context).toBe("spill");
    }
  });

  it("join with skew has context 'skewed'", () => {
    const annotation = getAnnotation("join", true, false);
    expect(annotation.context).toBe("skewed");
    expect(annotation.body).toContain("Skew detected");
  });

  it("join with spill has context 'spill'", () => {
    const annotation = getAnnotation("join", false, true);
    expect(annotation.context).toBe("spill");
    expect(annotation.body).toContain("Spill to disk");
  });

  it("filter in normal context mentions narrow transformation", () => {
    const annotation = getAnnotation("filter", false, false);
    expect(annotation.body).toContain("Narrow transformation");
  });

  it("group_by in normal context mentions wide transformation", () => {
    const annotation = getAnnotation("group_by", false, false);
    expect(annotation.body).toContain("Wide transformation");
  });

  it("all annotations have the correct transformation field", () => {
    const contexts: Array<[boolean, boolean]> = [
      [false, false],
      [true, false],
      [false, true],
      [true, true],
    ];
    for (const type of transformationTypes) {
      for (const [skew, spill] of contexts) {
        const annotation = getAnnotation(type, skew, spill);
        expect(annotation.transformation).toBe(type);
      }
    }
  });

  it("context is one of the valid AnnotationContext values", () => {
    const validContexts: AnnotationContext[] = ["normal", "skewed", "spill"];
    for (const type of transformationTypes) {
      const annotation = getAnnotation(type, false, false);
      expect(validContexts).toContain(annotation.context);
    }
  });
});
