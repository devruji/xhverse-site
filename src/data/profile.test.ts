import { describe, it, expect } from "vitest";
import { profile } from "./profile";

describe("Profile Data", () => {
  it("should export profile information", () => {
    expect(profile).toBeDefined();
    expect(profile.name).toBe("XH");
  });

  it("should have valid profile structures", () => {
    expect(profile).toHaveProperty("title");
    expect(profile).toHaveProperty("bio");
    expect(profile).toHaveProperty("longBio");
    expect(profile).toHaveProperty("statement");
    expect(profile).toHaveProperty("avatar");
    expect(profile).toHaveProperty("email");
    expect(profile).toHaveProperty("contactIntro");
  });
});
