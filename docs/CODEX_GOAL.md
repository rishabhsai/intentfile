# Codex goal workflow

Codex `/goal` is useful because it gives the agent a durable objective. The
missing question is usually: what exactly counts as done?

`intentfile` answers that question:

```txt
/goal keeps Codex moving.
intentfile defines done.
```

Use an intent file when a task needs more than a short prompt: permissions,
path boundaries, acceptance criteria, verification commands, and proof.

## Recommended flow

Create or update the task contract:

```bash
npm run intent -- init "Add password reset flow" --out task.intent.yaml
npm run intent -- validate task.intent.yaml
```

Render a copyable Codex goal command:

```bash
npm run intent -- goal task.intent.yaml --target codex
```

For longer tasks, render a goal document:

```bash
npm run intent -- goal task.intent.yaml --target codex --format markdown --out task.goal.md
```

Then start Codex with:

```txt
/goal follow the instructions in task.goal.md
```

## Why this works

Codex `/goal` handles persistence: it tells Codex to keep working toward a
durable objective. An intent file handles the stopping condition:

- `objective`: what Codex is trying to accomplish.
- `constraints`: where Codex may work and what tools or data are off limits.
- `acceptance`: the checklist that defines done.
- `proof_required`: the receipt Codex must produce before completion.

That means a goal is not just "keep going until it feels done." It is "keep
going until the intent acceptance criteria are satisfied and proof exists."

## Completion proof

After implementation, generate or update proof:

```bash
npm run intent -- proof task.intent.yaml --include-git --out task.proof.yaml
npm run intent -- verify task.intent.yaml task.proof.yaml
```

If command acceptance criteria can safely run in the workspace, verify with:

```bash
npm run intent -- verify task.intent.yaml task.proof.yaml --run
```

The verifier is conservative. It checks the contract and the evidence. It does
not claim product correctness unless the task's own tests or acceptance checks
establish that.

## Copyable agent instruction

```txt
Use intentfile as the definition-of-done layer for this Codex /goal task.

1. Create or update task.intent.yaml for the task.
2. Validate it with npm run intent -- validate task.intent.yaml.
3. Render a Codex goal with npm run intent -- goal task.intent.yaml --target codex.
4. Treat objective, constraints, acceptance, and proof_required as the stopping condition.
5. Keep working until every acceptance item has proof, or stop with unresolved_questions and blocker details.
6. Generate proof with npm run intent -- proof task.intent.yaml --include-git --out task.proof.yaml.
7. Verify with npm run intent -- verify task.intent.yaml task.proof.yaml.
```
