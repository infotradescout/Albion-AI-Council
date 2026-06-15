import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const highCourtLaw = readFileSync(
  resolve(repoRoot, "docs/albion/HIGH_COURT_LAW.md"),
  "utf8",
);

function acceleratorSection() {
  const start = highCourtLaw.indexOf(
    "## High Court Unconditional PASS Routing Accelerator (Bypass Rule)",
  );
  const end = highCourtLaw.indexOf("\n## ", start + 1);

  expect(start).toBeGreaterThanOrEqual(0);
  return highCourtLaw.slice(start, end === -1 ? undefined : end);
}

describe("High Court unconditional PASS routing accelerator doctrine", () => {
  it("allows a clean Gemini PASS to route directly to Roundtable Dispatch", () => {
    const section = acceleratorSection();

    expect(section).toContain("High Court Objector (Gemini)");
    expect(section).toContain("clean, unconditional `PASS`");
    expect(section).toContain("exempt from returning to the High Court Clerk/Chair");
    expect(section).toContain("may immediately route to Roundtable Dispatch");
  });

  it("returns PASS WITH CONDITIONS to Gawain", () => {
    const section = acceleratorSection();

    expect(section).toContain("`PASS WITH CONDITIONS`");
    expect(section).toContain("MUST route back to the High Court Clerk (Gawain)");
  });

  it("returns BLOCK to Gawain", () => {
    const section = acceleratorSection();

    expect(section).toContain("`BLOCK`");
    expect(section).toContain("MUST route back to the High Court Clerk (Gawain)");
  });

  it("fails closed for caveats, warnings, migrations, authority ambiguity, legal or trust warnings, and merge-risk annotations", () => {
    const section = acceleratorSection();

    expect(section).toContain("no database/schema migration requirements");
    expect(section).toContain("no legal/trust warning tags");
    expect(section).toContain("no merge-risk annotations");
    expect(section).toContain("non-trivial caveat");
    expect(section).toContain("authority");
    expect(section).toContain("accelerator is void");
  });

  it("does not create High Court merge authority", () => {
    const section = acceleratorSection();

    expect(section).toContain("routing accelerator only");
    expect(section).toContain("no merge, policy, governance approval, or execution rights");
  });

  it("does not bypass Roundtable human 3/3 or AI Council advisory validation requirements", () => {
    const section = acceleratorSection();

    expect(section).toContain("Unanimous Roundtable (3/3) human authority");
    expect(section).toContain("AI Council advisory validation requirements remain absolute");
  });

  it("does not grant Merlin execution authority", () => {
    const section = acceleratorSection();

    expect(section).toContain("Merlin execution eligibility check");
    expect(section).toContain("AI Council validation path");
    expect(section).toContain("the `PASS` does not approve the packet");
    expect(highCourtLaw).toContain(
      "This packet is recommendation-only and cannot pass work into Merlin by itself.",
    );
  });

  it("requires any ambiguity to fail closed", () => {
    const section = acceleratorSection();

    expect(section).toContain("Fail-Closed Default");
    expect(section).toContain("accelerator is void");
    expect(section).toContain("MUST route back to the High Court Clerk (Gawain)");
  });
});
