# Codex demo

Generate a brief from the password reset example:

```bash
npm run intent -- brief examples/password-reset.intent.yaml --target codex
```

For Codex `/goal`, render a durable goal command instead:

```bash
npm run intent -- goal examples/password-reset.intent.yaml --target codex
```

Give the resulting prompt or goal command to a coding agent. After the agent
finishes, create a proof file:

```bash
npm run intent -- proof examples/password-reset.intent.yaml --include-git --out password-reset.proof.yaml
```

Then verify:

```bash
npm run intent -- verify examples/password-reset.intent.yaml password-reset.proof.yaml
```

The important comparison is not that the agent becomes perfect. The improvement
is that `/goal` keeps Codex moving while the intent defines explicit boundaries,
acceptance criteria, and a proof shape that can be reviewed.
