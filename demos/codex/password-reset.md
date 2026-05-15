# Codex demo

Generate a brief from the password reset example:

```bash
npm run intent -- brief examples/password-reset.intent.yaml --target codex
```

Give the resulting prompt to a coding agent. After the agent finishes, create a
proof file:

```bash
npm run intent -- proof examples/password-reset.intent.yaml --include-git --out password-reset.proof.yaml
```

Then verify:

```bash
npm run intent -- verify examples/password-reset.intent.yaml password-reset.proof.yaml
```

The important comparison is not that the agent becomes perfect. The improvement
is that the task has explicit boundaries and the final answer has a proof shape
that can be reviewed.
