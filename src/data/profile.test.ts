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

  it("uses a PNG avatar URL so crawlers preserve transparency", () => {
    expect(profile.avatar).toBe("/images/xh-profile-960.png");
  });

  it("should expose a valid contact email", () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("keeps branded search identity terms explicit", () => {
    expect(profile.alternateNames).toEqual(
      expect.arrayContaining([
        "XH",
        "XHVERSE",
        "xhverse.co",
        "bossruji",
        "Rujikorn Ngoensaard",
      ]),
    );
    expect(profile.keywords).toEqual(
      expect.arrayContaining(["xhverse", "bossruji", "Rujikorn Ngoensaard"]),
    );
    expect(profile.knowsAbout).toContain("Data platform architecture");
  });
});
