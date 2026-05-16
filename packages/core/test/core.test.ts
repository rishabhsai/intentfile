import { describe, expect, it } from "vitest";
import {
  createStarterProof,
  parseIntent,
  parseProof,
  renderBrief,
  renderGoal,
  validateIntent,
  verifyIntentProof
} from "../src/index.js";

const intentYaml = `
intent: intentfile/v0.1
id: intent_test
title: Test task
objective: Do the thing.
constraints:
  allowed_paths:
    - src/**
  denied_paths:
    - .env
  denied_tools:
    - secrets.read
acceptance:
  - id: A1
    statement: The thing works.
  - id: A2
    command: npm test
    must_pass: true
proof_required:
  - changed_files
  - tests_run
  - acceptance_checklist
`;

describe("intentfile core", () => {
  it("validates a basic intent", () => {
    const intent = parseIntent(intentYaml);
    const result = validateIntent(intent);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("renders a useful brief", () => {
    const intent = parseIntent(intentYaml);
    const brief = renderBrief(intent, "codex");
    expect(brief).toContain("## Objective");
    expect(brief).toContain("A2: run `npm test` and pass");
    expect(brief).toContain("Codex Notes");
  });

  it("renders a Codex goal command and markdown goal", () => {
    const intent = parseIntent(intentYaml);
    const command = renderGoal(intent, {
      target: "codex",
      format: "command",
      intentPath: "task.intent.yaml"
    });
    const markdown = renderGoal(intent, {
      target: "codex",
      format: "markdown",
      intentPath: "task.intent.yaml",
      proofPath: "task.proof.yaml"
    });

    expect(command).toContain("/goal Complete the intentfile task");
    expect(command).toContain("definition of done");
    expect(markdown).toContain("## Definition Of Done");
    expect(markdown).toContain("A2: run `npm test` and pass");
    expect(markdown).toContain("task.proof.yaml");
  });

  it("creates a proof skeleton from acceptance criteria", () => {
    const intent = parseIntent(intentYaml);
    const proof = createStarterProof(intent);
    expect(proof.intent_id).toBe("intent_test");
    expect(Object.keys(proof.acceptance)).toEqual(["A1", "A2"]);
  });

  it("verifies matching proof", () => {
    const intent = parseIntent(intentYaml);
    const proof = parseProof(`
proof: intentproof/v0.1
intent_id: intent_test
status: completed
acceptance:
  A1:
    status: pass
    notes: Checked manually.
  A2:
    status: pass
    command: npm test
tests_run:
  - command: npm test
    status: passed
changed_files:
  - src/index.ts
`);

    const result = verifyIntentProof(intent, proof);
    expect(result.valid).toBe(true);
    expect(result.acceptance.passed).toBe(2);
  });
});
