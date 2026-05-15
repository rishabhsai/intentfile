# Agent onboarding reference

Use this when setting up intentfile for a new agent or workspace.

## Install

```bash
git clone https://github.com/rishabhsai/intentfile.git
cd intentfile
npm install
npm audit
npm test
npm run typecheck
npm run build
```

If the repository already exists, fetch or pull instead of recloning.

## Install skill

For Codex-style local skills:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/intentfile "${CODEX_HOME:-$HOME/.codex}/skills/intentfile"
```

If a local skill already exists, inspect it and ask before overwriting user
changes.

If skills are not supported, read `skills/intentfile/SKILL.md` directly and use
it as the operating guide.

## Use CLI

Prefer the workspace script until npm publication:

```bash
npm run intent -- validate examples/password-reset.intent.yaml
```

If global links are acceptable:

```bash
npm link -w packages/cli
intent validate examples/password-reset.intent.yaml
```
