import { expect, it } from "vitest";
import { createReviewSnapshot } from "./design-review";
import { createPublicationSnapshot } from "./publication";

it("keeps temporary review content on the public content authority", () => {
  expect(createReviewSnapshot).toBe(createPublicationSnapshot);
});
