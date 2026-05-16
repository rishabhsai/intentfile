# Copy-paste agent prompt

Paste this into a coding agent to install intentfile, load the skill guidance,
verify the CLI, and start using `.intent.yaml` task contracts.

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

Replace "the task I give you" with a concrete task when you want the agent to
create the first intent immediately.
