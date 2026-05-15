# Roadmap

## Milestone 1: Spec and examples

- Human-readable v0.1 spec.
- JSON Schemas for intent and proof.
- Example intent files for feature, bugfix, dependency upgrade, and research.
- Example proof file.

## Milestone 2: Validator

- Parse YAML and JSON.
- Validate required fields.
- Emit errors and warnings.
- Add tests.

## Milestone 3: Brief renderer

- Convert intent files into agent-ready prompts.
- Support generic, Codex, Claude Code, and Cursor targets.

## Milestone 4: Proof generator

- Generate starter proof files.
- Optionally include changed files from git.
- Pre-fill command acceptance criteria.

## Milestone 5: Verifier

- Compare proof against intent.
- Check proof sections and acceptance status.
- Warn about obvious path policy violations.
- Optionally re-run command-based acceptance criteria.

## Milestone 6: GitHub integration

- Convert GitHub issues into intent files.
- Attach proof summaries to pull requests.
- Publish a reusable GitHub Action.

## v0.2 ideas

- Signed intents.
- Signed proofs.
- Policy packs.
- MCP server.
- A2A adapter.
- VS Code extension.
- GitHub App.
- Web viewer for intent and proof files.
- Permission enforcement proxy.
- `intent.lock` for pinned tools, models, and MCP servers.
