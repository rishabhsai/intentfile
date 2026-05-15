# AGENTS.md

This repository builds `intentfile`, a small TypeScript implementation of a
portable task contract for AI agents.

## First commands

```bash
npm install
npm test
npm run typecheck
npm run build
```

Use these before and after meaningful changes. If a command fails, fix the
failure or document the exact reason in your final proof.

## Project map

- `packages/core`: parser, schemas, validation, brief rendering, proof helpers,
  and verifier logic.
- `packages/cli`: command-line interface named `intent`.
- `apps/site`: public website.
- `spec`: human spec and JSON Schemas.
- `examples`: valid intent and proof files.
- `docs`: setup and roadmap notes for humans and agents.
- `demos`: short runnable or copyable demos.

## Engineering rules

- Keep the core format small and human-readable.
- Prefer explicit validation errors over surprising coercion.
- The verifier must stay honest about what it can prove.
- Do not add hosted-service requirements to the happy path.
- Keep CLI output concise enough to paste into agent transcripts.
- Update examples and docs when schema behavior changes.

## Common tasks

Validate an example:

```bash
npm run intent -- validate examples/password-reset.intent.yaml
```

Render an agent brief:

```bash
npm run intent -- brief examples/password-reset.intent.yaml --target codex
```

Generate proof:

```bash
npm run intent -- proof examples/password-reset.intent.yaml --include-git
```

Verify proof:

```bash
npm run intent -- verify examples/password-reset.intent.yaml examples/proof/password-reset.proof.yaml
```

## Change expectations

When changing schemas, also update:

- `spec/intentfile-v0.1.md`
- examples under `examples/`
- tests under `packages/core/test/`
- CLI help text if user-facing behavior changed

When changing website UI, run:

```bash
npm run build -w apps/site
```

Then inspect the site locally if possible.
