# intentfile

Stop giving agents vague prompts.

`intentfile` is a tiny open format for agent tasks. It defines the objective,
constraints, permissions, acceptance criteria, and proof required before an
agent can call the job done.

```yaml
intent: intentfile/v0.1
id: intent_01J7W7M2ZK7QH6Z7N9Z6M1A4X8
title: Add password reset flow
objective: Implement an email-based password reset flow for existing users.

acceptance:
  - id: A1
    statement: Users can request a password reset link by email.
  - id: A2
    command: npm test
    must_pass: true

proof_required:
  - changed_files
  - tests_run
  - acceptance_checklist
```

## Why this exists

AI coding agents can do useful work, but the handoff format is still weak. A
chat prompt, issue comment, or loose Markdown checklist is easy to misread and
hard to audit later.

An `.intent.yaml` file is a portable task contract:

- what the agent should do
- what context it should consider
- what files, tools, and domains it may use
- what "done" means
- what proof must come back

The project is intentionally small. It should compose with Codex, Claude Code,
Cursor, GitHub Actions, MCP, A2A, custom runners, and normal human review.

## Quick start

```bash
npm install
npm run build
npm run intent -- init "Add password reset flow" --out task.intent.yaml
npm run intent -- validate task.intent.yaml
npm run intent -- brief task.intent.yaml --target codex
npm run intent -- goal task.intent.yaml --target codex
npm run intent -- proof task.intent.yaml --out task.proof.yaml
npm run intent -- verify task.intent.yaml task.proof.yaml
```

The CLI binary is named `intent` once the package is installed globally or run
from the built workspace.

```bash
intent init "Fix checkout bug" --template bugfix --out checkout.intent.yaml
intent validate checkout.intent.yaml
intent brief checkout.intent.yaml --target codex
intent goal checkout.intent.yaml --target codex
```

## Codex `/goal`

Codex `/goal` keeps Codex working toward a durable objective. `intentfile`
defines what done means for that objective.

```txt
/goal keeps Codex moving. intentfile defines done.
```

Render a copyable goal command:

```bash
npm run intent -- goal task.intent.yaml --target codex
```

For longer tasks, render a goal document and point Codex at it:

```bash
npm run intent -- goal task.intent.yaml --target codex --format markdown --out task.goal.md
```

Then paste:

```txt
/goal follow the instructions in task.goal.md
```

See [docs/CODEX_GOAL.md](./docs/CODEX_GOAL.md) for the full workflow.

## Copy-paste prompt for your agent

Paste this into a coding agent when you want it to install intentfile, load the
repo skill, verify the CLI, and start working from an `.intent.yaml` contract:

```txt
Install and use intentfile in this workspace.

Repository: https://github.com/rishabhsai/intentfile

Tasks:
1. Clone the repo if it is not already present, then run npm install, npm run build, npm test, npm run typecheck, and npm audit.
2. Use the CLI through npm run intent -- from the repo. If global npm links are acceptable in this environment, run npm link -w packages/cli and verify intent --help.
3. If Codex-style local skills are supported, install the repo skill by copying skills/intentfile to ${CODEX_HOME:-$HOME/.codex}/skills/intentfile. If local skills are not supported, read skills/intentfile/SKILL.md and follow it as your operating guide.
4. Read AGENTS.md, docs/AGENT_ONBOARDING.md, docs/CODEX_GOAL.md, spec/intentfile-v0.1.md, and examples/password-reset.intent.yaml.
5. Create or update a .intent.yaml for the task I give you, validate it, render a brief for the target agent, and if Codex /goal is available render a goal with npm run intent -- goal task.intent.yaml --target codex.
6. Treat the intent objective, constraints, acceptance, and proof_required as the definition of done. Require a .proof.yaml before calling the work done.
7. At the end, report the exact commands you ran, changed files, acceptance status, and any unresolved questions.
```

For a slower, more explicit version of this workflow, see
[docs/AGENT_ONBOARDING.md](./docs/AGENT_ONBOARDING.md).

## Repository layout

```txt
intentfile/
  README.md
  AGENTS.md
  spec/
    intentfile-v0.1.md
    intentfile.schema.json
    proof.schema.json
  examples/
    password-reset.intent.yaml
    codex-goal.intent.yaml
    dependency-upgrade.intent.yaml
    bugfix.intent.yaml
    research.intent.yaml
    proof/password-reset.proof.yaml
  packages/
    core/
    cli/
  apps/
    site/
  docs/
    AI_AGENT_SETUP.md
    AGENT_ONBOARDING.md
    CODEX_GOAL.md
    COPY_PASTE_AGENT_PROMPT.md
    ROADMAP.md
  skills/
    intentfile/
  demos/
    codex/
    github-action/
```

## Current implementation

- `@intentfile/core`: TypeScript parser, schema validation, brief rendering,
  starter proof generation, and proof verification.
- `@intentfile/cli`: `intent init`, `validate`, `brief`, `goal`, `proof`,
  `verify`, `convert`, and `from github`.
- `apps/site`: simple editorial website using the same sparse rhythm as
  `new.rishabhsai.com`.
- `.github/workflows/test.yml`: install, test, typecheck, and build.

This is v0.1 groundwork. The verifier is conservative by design: it can check
schemas, required proof fields, acceptance status, obvious path boundaries, and
command results when asked to run them. It does not pretend to prove product
semantics without domain-specific tests.

## For AI agents

Start with [AGENTS.md](./AGENTS.md), then follow
[docs/AGENT_ONBOARDING.md](./docs/AGENT_ONBOARDING.md). If your agent supports
Codex-style local skills, install or read [skills/intentfile/SKILL.md](./skills/intentfile/SKILL.md).
The docs are written for fresh agents that need to clone, install, verify, and
safely continue work.

## Status

This repository is ready for early spec discussion and CLI iteration. The next
useful milestones are stricter path matching, GitHub Action packaging, signed
proof experiments, and richer examples for real agent workflows.
