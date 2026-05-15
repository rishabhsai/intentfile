# AI agent setup guide

This guide is for a fresh AI agent taking over the repository with no prior
context.

## 1. Understand the project

`intentfile` defines a portable task contract for agentic work. The core files
are:

- `spec/intentfile-v0.1.md`: human-readable format definition.
- `spec/intentfile.schema.json`: JSON Schema for `.intent.yaml` and `.intent.json`.
- `spec/proof.schema.json`: JSON Schema for `.proof.yaml` and `.proof.json`.
- `packages/core`: TypeScript implementation.
- `packages/cli`: command-line wrapper.
- `examples`: files that should stay valid.

The key product rule: a completed task should produce proof. Do not let the CLI
or docs imply that intentfile proves semantics it cannot actually prove.

## 2. Install and verify

```bash
npm install
npm test
npm run typecheck
npm run build
```

If you only need to work on the site:

```bash
npm install
npm run dev:site
```

If you only need to exercise the CLI during development:

```bash
npm run intent -- validate examples/password-reset.intent.yaml
npm run intent -- brief examples/password-reset.intent.yaml --target codex
```

## 3. Expected checks

Before handing work back, run the smallest checks that cover your change:

- Core logic: `npm test -w packages/core`
- CLI type safety: `npm run typecheck -w packages/cli`
- Website: `npm run build -w apps/site`
- Whole repo: `npm test && npm run typecheck && npm run build`

Report any skipped check and why.

## 4. Common implementation notes

- Keep schemas and TypeScript behavior aligned.
- Keep examples valid.
- Add warnings for risky delegation rather than silently allowing it.
- Prefer separate proof files over mutating the original intent.
- Keep path checks conservative. v0.1 path checks are advisory, not a sandbox.
- Do not add a database, hosted API, or account requirement to the basic flow.

## 5. Adding a new intent field

1. Update `spec/intentfile-v0.1.md`.
2. Update `spec/intentfile.schema.json`.
3. Update `packages/core/src/schemas.ts`.
4. Add or update tests in `packages/core/test`.
5. Update examples if the field should be visible in the happy path.
6. Run `npm test && npm run typecheck && npm run build`.

## 6. Adding a CLI command

1. Put reusable logic in `packages/core` when possible.
2. Keep `packages/cli` focused on argument parsing, file IO, and process output.
3. Add help text that makes the command copyable.
4. Update README quick start if the command is part of the common workflow.

## 7. Proof language

Use honest wording:

- Good: "verified required proof fields exist"
- Good: "warned about files outside allowed paths"
- Good: "re-ran command acceptance criteria"
- Bad: "proved the feature works" unless domain-specific tests actually did

## 8. Release notes template

```md
## Summary

- What changed.
- Why it matters.

## Verification

- Command: `npm test`
- Command: `npm run typecheck`
- Command: `npm run build`

## Risks

- Known limitations or unchecked behavior.
```
