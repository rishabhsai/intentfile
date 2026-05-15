# Agent onboarding

This guide is the canonical setup path for AI agents working with intentfile.
It explains what to install, what to read, what to verify, and how to use the
format without overclaiming what verification can prove.

## 1. Mental model

`intentfile` has three moving parts:

- Intent: `.intent.yaml` or `.intent.json`; the task contract.
- Brief: a prompt rendered from the intent for a target agent.
- Proof: `.proof.yaml` or `.proof.json`; the receipt returned when work is done.

An intent says what to do, what boundaries apply, what done means, and what
proof is required. A proof says what happened, which acceptance items passed,
which commands ran, which files changed, and what remains unresolved.

The verifier is conservative. It checks structure and evidence. It does not
magically prove product correctness without project-specific tests.

## 2. Install from GitHub

```bash
git clone https://github.com/rishabhsai/intentfile.git
cd intentfile
npm install
npm audit
npm test
npm run typecheck
npm run build
```

If the repo already exists, pull or fetch normally instead of recloning.

## 3. Use the CLI

During early v0 development, the most reliable CLI path is the workspace script:

```bash
npm run intent -- --help
npm run intent -- validate examples/password-reset.intent.yaml
npm run intent -- brief examples/password-reset.intent.yaml --target codex
npm run intent -- proof examples/password-reset.intent.yaml --out /tmp/password-reset.proof.yaml
npm run intent -- verify examples/password-reset.intent.yaml examples/proof/password-reset.proof.yaml
```

If the environment allows global npm links, install the local CLI binary:

```bash
npm link -w packages/cli
intent --help
intent validate examples/password-reset.intent.yaml
```

Do not assume the package has been published to npm until the README says so.

## 4. Install or load the skill

Codex-style local skills can use the repo-packaged skill:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/intentfile "${CODEX_HOME:-$HOME/.codex}/skills/intentfile"
```

If the skill already exists, inspect it before replacing it. Do not overwrite a
user-modified local skill without explicit permission.

If the agent runtime does not support local skills, read
`skills/intentfile/SKILL.md` and follow it as the operating guide.

## 5. Files agents should read

For ordinary implementation work:

- `AGENTS.md`
- `skills/intentfile/SKILL.md`
- `spec/intentfile-v0.1.md`
- relevant examples under `examples/`

For schema or validator changes:

- `spec/intentfile.schema.json`
- `spec/proof.schema.json`
- `packages/core/src/schemas.ts`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.ts`

For CLI changes:

- `packages/cli/src/index.ts`
- `packages/core/src/index.ts`
- `README.md`
- examples that demonstrate the behavior

For landing page changes:

- `apps/site/index.html`
- `apps/site/styles.css`
- `docs/COPY_PASTE_AGENT_PROMPT.md`

## 6. Create an intent

```bash
npm run intent -- init "Add password reset flow" --template feature --out password-reset.intent.yaml
npm run intent -- validate password-reset.intent.yaml
npm run intent -- brief password-reset.intent.yaml --target codex --out password-reset.brief.md
```

Before giving the brief to an agent, check that:

- `objective` is concrete.
- `constraints.allowed_paths` and `constraints.denied_paths` are realistic.
- command acceptance items use commands that can run in the target repo.
- `proof_required` includes at least `changed_files`, `tests_run`, and
  `acceptance_checklist`.

## 7. Complete with proof

```bash
npm run intent -- proof password-reset.intent.yaml --include-git --out password-reset.proof.yaml
npm run intent -- verify password-reset.intent.yaml password-reset.proof.yaml
```

A useful proof includes:

- changed files
- commands run
- test results
- acceptance status for every item
- unresolved questions
- risk notes
- commit or pull request links when available

## 8. Validation language

Use precise wording in final answers:

- Good: "The proof includes all required sections."
- Good: "The command acceptance item has a passed test record."
- Good: "The verifier warned about a changed file outside allowed_paths."
- Bad: "The verifier proved the feature works" unless domain tests actually did.

## 9. Common failure modes

- Missing proof section: add the required key to `.proof.yaml`.
- Acceptance item missing proof: add an entry under `proof.acceptance`.
- Command acceptance has no evidence: add a matching `tests_run` entry or run
  `intent verify --run`.
- Changed file outside allowed paths: either fix the work or update the intent
  before the work starts.
- Invalid timestamp: use ISO 8601, for example `2026-05-15T12:00:00Z`.

## 10. Final handoff format

When handing work back, include:

```md
Summary:
- What changed.

Verification:
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm audit`

Intent proof:
- intent file:
- proof file:
- acceptance:
- unresolved questions:
```
