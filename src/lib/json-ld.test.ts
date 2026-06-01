import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("escapes script-breaking characters in JSON-LD", () => {
    const json = serializeJsonLd({
      headline: "</script><script>alert(1)</script>",
      description: "A&B > C",
      separator: "\u2028\u2029",
    });

    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003C/script\\u003E");
    expect(json).toContain("A\\u0026B \\u003E C");
    expect(json).toContain("\\u2028\\u2029");
  });
});
