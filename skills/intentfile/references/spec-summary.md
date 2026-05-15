# Spec summary

## Intent file

Required fields:

- `intent`: currently `intentfile/v0.1`
- `id`: stable task identifier
- `title`: short task title
- `objective`: main task
- `acceptance`: non-empty array with unique `id` values
- `proof_required`: non-empty proof section list

Useful optional fields:

- `background`
- `context`
- `inputs`
- `constraints`
- `budgets`
- `deliverables`
- `metadata`

Acceptance item shapes:

- `statement`: human-reviewable criterion
- `command`: machine-checkable command, usually with `must_pass: true`
- `file_exists`: required file output
- `http`: basic HTTP status check

## Proof file

Required fields:

- `proof`: currently `intentproof/v0.1`
- `intent_id`: must match intent `id`
- `status`: `completed`, `partial`, `blocked`, `failed`, or `rejected`
- `acceptance`: status for each acceptance item

Common proof sections:

- `changed_files`
- `tests_run`
- `commands_run`
- `unresolved_questions`
- `risk_notes`
- `artifacts`

## Verification limits

The verifier can check schema validity, required sections, acceptance status,
command evidence, and obvious path policy issues. It cannot prove domain
correctness without domain tests.
