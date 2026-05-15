# GitHub Action demo

This repository already includes `.github/workflows/test.yml` for normal repo
checks. A future reusable intentfile action should do this:

```yaml
name: Verify intent proof

on:
  pull_request:

jobs:
  verify-intent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx intent verify task.intent.yaml task.proof.yaml
```

The action should stay conservative: it can verify structure, required proof,
command results, and obvious path issues. It should not claim semantic proof
without project tests.
