import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readDoctrine(relativePath: string) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const currentDoctrinePaths = [
  "docs/albion/ALBION_CONTROL_BIBLE.md",
  "docs/albion/AUTHORITY_MATRIX.md",
  "docs/albion/HIGH_COURT_LAW.md",
  "docs/albion/MERLIN_OPERATIONAL_ROUTER.md",
  "docs/albion/ROUNDTABLE_AUTHORITY.md",
] as const;

describe("Albion canonical stack doctrine", () => {
  it("locks the canonical Albion, Roundtable, AI Council, and Merlin stack", () => {
    const controlBible = readDoctrine("docs/albion/ALBION_CONTROL_BIBLE.md");

    expect(controlBible).toContain(
      "Albion defines the law. Roundtable holds human authority. AI Council advises and objects. Merlin transports and executes only after authority is satisfied.",
    );
    expect(controlBible).toContain(
      "Roundtable is the human authority layer for Knights, dispatch, human input, and future human-facing output.",
    );
    expect(controlBible).toContain(
      "AI Council is the advisory frontier AI layer for planning, orchestration, objection, and drift prevention.",
    );
    expect(controlBible).toContain(
      "Merlin executes routes only after Roundtable human authority is satisfied and Merlin eligibility checks pass.",
    );
  });

  it("keeps 3/3 law on Roundtable human authority rather than AI Council authority", () => {
    const roundtableAuthority = readDoctrine("docs/albion/ROUNDTABLE_AUTHORITY.md");
    const authorityMatrix = readDoctrine("docs/albion/AUTHORITY_MATRIX.md");

    expect(roundtableAuthority).toContain(
      "The 3/3 law belongs to Roundtable as human authority, not to the AI Council.",
    );
    expect(authorityMatrix).toContain(
      "Roundtable 3/3 is human Knight authority, not AI Council authority.",
    );
  });

  it("keeps AI Council advisory and non-authoritative", () => {
    const modelGovernance = readDoctrine(
      "docs/albion/ALBION_MODEL_GOVERNANCE_DOCTRINE.md",
    );

    expect(modelGovernance).toContain(
      "The AI Council is the advisory frontier AI layer: ChatGPT, Gemini, and Claude frontier models",
    );
    expect(modelGovernance).toContain("The Council may not self-authorize.");
    expect(modelGovernance).toContain(
      "The Council does not hold final authority, merge authority, policy authority, governance authority, or execution authority.",
    );
  });

  it("keeps active doctrine from using ambiguous Merlin approval shorthand", () => {
    const activeDoctrine = currentDoctrinePaths
      .map((path) => readDoctrine(path))
      .join("\n");

    expect(activeDoctrine).not.toContain("Merlin executes approved routes only");
    expect(activeDoctrine).not.toContain("approved packet");
    expect(activeDoctrine).toContain(
      "Roundtable human authority is satisfied",
    );
    expect(activeDoctrine).toContain("Merlin eligibility");
  });
});
