---
name: intentfile
description: Work with intentfile agent task contracts and proof files. Use when creating, validating, rendering, converting, or verifying `.intent.yaml`, `.intent.json`, `.proof.yaml`, or `.proof.json` files; when installing or using the `intent` CLI; when turning a human task, GitHub issue, or agent handoff into machine-checkable acceptance criteria; or when requiring proof-of-done from an AI agent.
---

# Intentfile

## Overview

Use intentfile to turn vague agent requests into portable task contracts. An
intent file defines the objective, constraints, acceptance criteria, and proof
required before an agent can call work done.

## First checks

In an intentfile repo checkout, run:

```bash
npm install
npm audit
npm test
npm run typecheck
npm run build
```

Use the CLI through the workspace during v0 development:

```bash
npm run intent -- --help
npm run intent -- validate examples/password-reset.intent.yaml
```

If global npm links are acceptable:

```bash
npm link -w packages/cli
intent --help
```

## Workflow

1. Read the task source: user request, issue, PR, or existing `.intent.yaml`.
2. Create or update an intent with a concrete objective, realistic constraints,
   and acceptance criteria.
3. Validate the intent before delegating work.
4. Render a brief for the target agent.
5. Require a proof file or proof-shaped final answer when work completes.
6. Verify proof against the intent and report errors, warnings, and residual risk.

## CLI tasks

Create an intent:

```bash
npm run intent -- init "Add password reset flow" --template feature --out task.intent.yaml
```

Validate:

```bash
npm run intent -- validate task.intent.yaml
```

Render a brief:

```bash
npm run intent -- brief task.intent.yaml --target codex --out task.brief.md
```

Create proof:

```bash
npm run intent -- proof task.intent.yaml --include-git --out task.proof.yaml
```

Verify proof:

```bash
npm run intent -- verify task.intent.yaml task.proof.yaml
```

## Authoring rules

- Keep `objective` specific enough that two agents would attempt the same job.
- Put boundaries in `constraints`, not buried in prose.
- Use command acceptance for checks the repo can actually run.
- Use statement acceptance for human-reviewable product behavior.
- Keep `proof_required` strong enough to audit the work later.
- Treat `allowed_paths` and `denied_paths` as declared policy, not a sandbox.
- Prefer warnings over false certainty when verification is advisory.

## Proof rules

Every acceptance item needs a proof status. Prefer object form for manual
criteria so notes can explain the evidence:

```yaml
acceptance:
  A1:
    status: pass
    notes: Added reset request endpoint and tests.
```

Use precise final language:

- Say "verified required proof fields exist".
- Say "command acceptance has passed evidence".
- Say "warned about a path outside allowed_paths".
- Do not say "proved the feature works" unless project tests prove it.

## References

- For install and onboarding details, read `references/agent-onboarding.md`.
- For field and schema summaries, read `references/spec-summary.md`.
- For CLI examples and expected outputs, read `references/cli-workflows.md`.
