# CLI workflows

## Validate

```bash
npm run intent -- validate examples/password-reset.intent.yaml
```

Expected result for the bundled example:

```txt
valid
```

## Render brief

```bash
npm run intent -- brief examples/password-reset.intent.yaml --target codex
```

Use `--target generic`, `--target codex`, `--target claude-code`, or
`--target cursor`.

## Render Codex goal

```bash
npm run intent -- goal examples/codex-goal.intent.yaml --target codex
```

Expected shape:

```txt
/goal Complete the intentfile task "...". Treat the intent objective, constraints, acceptance criteria, and proof_required as the definition of done.
```

For longer durable tasks:

```bash
npm run intent -- goal examples/codex-goal.intent.yaml --target codex --format markdown --out task.goal.md
```

## Generate proof

```bash
npm run intent -- proof examples/password-reset.intent.yaml --include-git --out task.proof.yaml
```

`--include-git` reads changed files from `git diff --name-only HEAD`.

## Verify proof

```bash
npm run intent -- verify examples/password-reset.intent.yaml examples/proof/password-reset.proof.yaml
```

Expected result for the bundled example:

```txt
Intent: Add password reset flow
Proof status: completed
Acceptance: 6/6 passed
Verification: passed
```

Use `--run` only when it is appropriate to execute command acceptance criteria
in the current workspace.
