# intentfile v0.1

`intentfile` is a tiny open format for giving AI agents a task, permissions,
acceptance criteria, and proof-of-done.

The default human-authored format is `.intent.yaml`. Machines may use the same
data model as JSON with `.intent.json`.

## Design principles

1. Human-readable first.
2. Machine-checkable where it matters.
3. Small core, extensible edges.
4. No platform lock-in.
5. Do not require a hosted service.
6. Make the happy path obvious.
7. Make unsafe delegation visible.
8. Every completed intent should produce proof.

## Minimal intent

```yaml
intent: intentfile/v0.1
id: intent_01J7W7M2ZK7QH6Z7N9Z6M1A4X8
title: Add password reset flow

objective: >
  Implement an email-based password reset flow for existing users.

acceptance:
  - id: A1
    statement: Users can request a password reset link by email.
  - id: A2
    statement: Reset tokens expire after one hour.
  - id: A3
    command: npm test
    must_pass: true

proof_required:
  - changed_files
  - tests_run
  - acceptance_checklist
```

## Required fields

- `intent`: spec version. v0.1 uses `intentfile/v0.1`.
- `id`: stable identifier. Recommended prefix: `intent_`.
- `title`: short human-readable task title.
- `objective`: the main task the agent should complete.
- `acceptance`: at least one acceptance item with a unique `id`.
- `proof_required`: proof sections the agent must return.

## Optional fields

- `created_at`: ISO timestamp.
- `expires_at`: ISO timestamp. Expired intents should warn, not fail.
- `background`: human context.
- `context`: repository, issue, branch, docs, design links, or related systems.
- `inputs`: files, URLs, datasets, screenshots, or other materials.
- `constraints`: allowed and denied paths, tools, domains, and data rules.
- `budgets`: soft limits for runtime, file changes, cost, tokens, or network.
- `deliverables`: expected outputs such as code, tests, docs, screenshots.
- `metadata`: flexible metadata for tools and humans.

## Acceptance items

Every acceptance item must have an `id`. v0.1 supports four item shapes.

Manual statement:

```yaml
- id: A1
  statement: Users can request a password reset link by email.
```

Command:

```yaml
- id: A2
  command: npm test
  must_pass: true
```

File exists:

```yaml
- id: A3
  file_exists: docs/auth.md
```

HTTP check:

```yaml
- id: A4
  http:
    method: GET
    url: http://localhost:3000/health
    expect_status: 200
```

## Proof file

Proof is separate from the intent so the original task contract stays stable.

```yaml
proof: intentproof/v0.1
intent_id: intent_01J7W7M2ZK7QH6Z7N9Z6M1A4X8
status: completed

acceptance:
  A1: pass
  A2: pass
  A3: pass

tests_run:
  - command: npm test
    status: passed

changed_files:
  - src/auth/reset.ts
  - src/auth/reset.test.ts
```

Recommended proof status values:

- `completed`
- `partial`
- `blocked`
- `failed`
- `rejected`

Recommended acceptance status values:

- `pass`
- `fail`
- `partial`
- `not_checked`
- `not_applicable`

## Validation rules

The v0.1 validator fails when:

- required fields are missing
- `intent` is unsupported
- `acceptance` is empty
- acceptance IDs are duplicated
- an acceptance item has no checkable or reviewable content
- `proof_required` is missing
- timestamp fields are invalid
- path or tool lists have the wrong type

The validator warns when:

- no command-based acceptance criteria exist
- no denied paths are declared
- no denied tools are declared
- proof requirements are too light
- an intent has expired
- allowed paths are very broad
- risky tools such as `payment.charge`, `email.send`, or `secrets.read` are allowed

## Verification rules

The v0.1 verifier checks that:

- `proof.intent_id` matches `intent.id`
- required proof sections exist
- every acceptance item has proof status
- required commands have proof and optionally pass when re-run
- manual statements marked `pass` include notes when possible
- proof changed files do not obviously violate allowed or denied paths

The verifier must be conservative. It can verify command results, file
existence, schema validity, and obvious path violations. It cannot fully verify
product correctness without domain-specific tests.
