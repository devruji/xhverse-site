import { describe, expect, it } from "vitest";
import {
  buildPractitionerToolBrief,
  calculatePractitionerToolResult,
  getToolTier,
  isAnswerValue,
} from "./engine";
import { practitionerToolDefinitions } from "./definitions";
import type { PractitionerToolDefinition, ToolAnswers } from "./types";

const definition = practitionerToolDefinitions[0];

function answersFor(value: 1 | 2 | 3 | 4): ToolAnswers {
  return Object.fromEntries(
    definition.questions.map((question) => [question.id, value]),
  ) as ToolAnswers;
}

describe("isAnswerValue", () => {
  it("accepts only supported answer values", () => {
    expect(isAnswerValue(1)).toBe(true);
    expect(isAnswerValue(4)).toBe(true);
    expect(isAnswerValue(0)).toBe(false);
    expect(isAnswerValue(5)).toBe(false);
  });
});

describe("getToolTier", () => {
  it("returns the highest matching tier", () => {
    expect(getToolTier(100, definition.tiers).label).toBe("Production-ready");
    expect(getToolTier(85, definition.tiers).label).toBe("Production-ready");
    expect(getToolTier(65, definition.tiers).label).toBe("Usable with gaps");
    expect(getToolTier(40, definition.tiers).label).toBe("Needs design work");
    expect(getToolTier(0, definition.tiers).label).toBe("High-risk");
    expect(getToolTier(-1, definition.tiers).label).toBe("High-risk");
  });

  it("does not require tiers to be pre-sorted", () => {
    const shuffled = [
      definition.tiers[3],
      definition.tiers[1],
      definition.tiers[0],
      definition.tiers[2],
    ];

    expect(getToolTier(72, shuffled).label).toBe("Usable with gaps");
  });
});

describe("calculatePractitionerToolResult", () => {
  it("scores all high answers as production-ready with no gaps", () => {
    const result = calculatePractitionerToolResult(definition, answersFor(4));

    expect(result.score).toBe(100);
    expect(result.tier.label).toBe("Production-ready");
    expect(result.gaps).toHaveLength(0);
    expect(result.strengths).toHaveLength(definition.questions.length);
    expect(result.priorityActions).toEqual(definition.strongResultActions);
  });

  it("prioritizes gaps for low answers", () => {
    const result = calculatePractitionerToolResult(definition, answersFor(1));

    expect(result.score).toBe(25);
    expect(result.tier.label).toBe("High-risk");
    expect(result.gaps).toHaveLength(definition.questions.length);
    expect(result.strengths).toHaveLength(0);
    expect(result.priorityActions).toHaveLength(4);
    expect(result.gaps.map((gap) => gap.action)).toContain(
      "Name an accountable product owner and a technical owner before adding consumers.",
    );
  });

  it("uses watch-item actions when there are no critical gaps", () => {
    const result = calculatePractitionerToolResult(definition, answersFor(3));

    expect(result.score).toBe(75);
    expect(result.gaps).toHaveLength(0);
    expect(result.priorityActions).toHaveLength(4);
    expect(result.priorityActions[0]).toContain("review cadence");
  });

  it("treats missing answers as gaps with zero score", () => {
    const partial: ToolAnswers = {
      [definition.questions[0].id]: 4,
    };
    const result = calculatePractitionerToolResult(definition, partial);

    expect(result.score).toBe(17);
    expect(result.questionResults[0].answerLabel).toBe("Operated");
    expect(result.questionResults[1].answerValue).toBeNull();
    expect(result.questionResults[1].score).toBe(0);
    expect(result.gaps[0].score).toBe(0);
  });

  it("uses fallback action when an invalid definition misses an answer option label", () => {
    const customDefinition: PractitionerToolDefinition = {
      ...definition,
      questions: [
        {
          ...definition.questions[0],
          options: definition.questions[0].options.filter((option) => option.value !== 2),
        },
      ],
    };

    const result = calculatePractitionerToolResult(customDefinition, {
      [customDefinition.questions[0].id]: 2,
    });

    expect(result.questionResults[0].answerLabel).toBeNull();
    expect(result.questionResults[0].action).toBe(
      customDefinition.questions[0].actions[2],
    );
  });
});

describe("buildPractitionerToolBrief", () => {
  it("builds a copyable brief with score, gaps, actions, reading, and CTA", () => {
    const result = calculatePractitionerToolResult(definition, answersFor(2));
    const brief = buildPractitionerToolBrief(definition, result);

    expect(brief).toContain("Data Product Contract Brief");
    expect(brief).toContain("Overall score: 50/100");
    expect(brief).toContain("Gaps to close:");
    expect(brief).toContain("Recommended actions:");
    expect(brief).toContain("/blog/data-product-as-platform-contract");
    expect(brief).toContain("/services");
  });

  it("states when no critical gaps are identified", () => {
    const result = calculatePractitionerToolResult(definition, answersFor(4));
    const brief = buildPractitionerToolBrief(definition, result);

    expect(brief).toContain("- No critical gaps identified");
  });

  it("shows unanswered dimensions in the brief", () => {
    const result = calculatePractitionerToolResult(definition, {});
    const brief = buildPractitionerToolBrief(definition, result);

    expect(brief).toContain("Not answered (0/100)");
  });
});
