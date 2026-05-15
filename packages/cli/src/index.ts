#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { mkdir } from "node:fs/promises";
import { Command } from "commander";
import {
  createStarterIntent,
  createStarterProof,
  formatYaml,
  parseIntent,
  parseProof,
  readIntentFile,
  readProofFile,
  renderBrief,
  validateIntent,
  validateProof,
  verifyIntentProof,
  type IntentFile,
  type ProofFile
} from "@intentfile/core";

const program = new Command();

program
  .name("intent")
  .description("Create, validate, render, and verify intentfile task contracts.")
  .version("0.1.0");

program
  .command("init")
  .description("Create a starter .intent.yaml file.")
  .argument("[title]", "task title", "Untitled task")
  .option("-t, --template <name>", "template name", "feature")
  .option("-o, --out <file>", "write output to a file")
  .action(async (title: string, options: { template: string; out?: string }) => {
    const intent = createStarterIntent(title, options.template);
    await writeOrPrint(formatYaml(intent), options.out);
  });

program
  .command("validate")
  .description("Validate an intent or proof file.")
  .argument("<file>", "intent or proof file")
  .option("--json", "print JSON result")
  .action(async (file: string, options: { json?: boolean }) => {
    const content = await readFile(file, "utf8");
    const parsed = parseAny(content, file);
    const result = isProof(parsed) ? validateProof(parsed) : validateIntent(parsed);
    printValidation(result, options.json);
    process.exitCode = result.valid ? 0 : 1;
  });

program
  .command("brief")
  .description("Render an intent into an agent-ready prompt.")
  .argument("<intent>", "intent file")
  .option("--target <name>", "generic, codex, claude-code, or cursor", "generic")
  .option("-o, --out <file>", "write output to a file")
  .action(async (file: string, options: { target: string; out?: string }) => {
    const intent = await readIntentFile(file);
    await writeOrPrint(renderBrief(intent, options.target), options.out);
  });

program
  .command("proof")
  .description("Create a starter proof file for an intent.")
  .argument("<intent>", "intent file")
  .option("-o, --out <file>", "write output to a file")
  .option("--include-git", "include changed files from git diff")
  .action(async (file: string, options: { out?: string; includeGit?: boolean }) => {
    const intent = await readIntentFile(file);
    const proof = createStarterProof(intent);

    if (options.includeGit) {
      proof.changed_files = gitChangedFiles();
    }

    await writeOrPrint(formatYaml(proof), options.out);
  });

program
  .command("verify")
  .description("Verify proof against an intent.")
  .argument("<intent>", "intent file")
  .argument("<proof>", "proof file")
  .option("--run", "run command-based acceptance criteria before reporting")
  .option("--json", "print JSON result")
  .action(async (intentFile: string, proofFile: string, options: { run?: boolean; json?: boolean }) => {
    const intent = await readIntentFile(intentFile);
    const proof = await readProofFile(proofFile);
    const result = verifyIntentProof(intent, proof);

    if (options.run) {
      for (const item of intent.acceptance.filter((acceptance) => acceptance.command && acceptance.must_pass !== false)) {
        const command = item.command ?? "";
        const status = runShell(command);
        if (status !== 0) {
          result.errors.push(`command failed for acceptance "${item.id}": ${command}`);
        }
      }
      result.valid = result.errors.length === 0;
    }

    printVerification(intent, proof, result, options.json);
    process.exitCode = result.valid ? 0 : 1;
  });

program
  .command("convert")
  .description("Convert an intent or proof file between YAML, JSON, and simple A2A payloads.")
  .argument("<file>", "file to convert")
  .requiredOption("--to <format>", "yaml, json, or a2a")
  .option("-o, --out <file>", "write output to a file")
  .action(async (file: string, options: { to: string; out?: string }) => {
    const content = await readFile(file, "utf8");
    const parsed = parseAny(content, file);
    const output = convertAny(parsed, options.to);
    await writeOrPrint(output, options.out);
  });

const from = program.command("from").description("Create intent files from external systems.");

from
  .command("github")
  .description("Create an intent from a GitHub issue reference.")
  .argument("<ref>", "owner/repo#123 or GitHub issue URL")
  .option("-o, --out <file>", "write output to a file")
  .action(async (ref: string, options: { out?: string }) => {
    const issue = readGithubIssue(ref);
    const intent = createStarterIntent(issue.title, "feature");
    intent.objective = issue.body?.trim() || issue.title;
    intent.context = {
      repo: `github:${issue.owner}/${issue.repo}`,
      issue: `github:${issue.owner}/${issue.repo}#${issue.number}`,
      url: issue.url
    };
    intent.metadata = {
      labels: issue.labels
    };

    await writeOrPrint(formatYaml(intent), options.out);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`error: ${message}`);
  process.exitCode = 1;
});

function parseAny(content: string, file: string): IntentFile | ProofFile {
  const parsed = file.endsWith(".json") || content.trimStart().startsWith("{")
    ? (JSON.parse(content) as IntentFile | ProofFile)
    : parseIntentOrProof(content, file);
  return parsed;
}

function parseIntentOrProof(content: string, file: string): IntentFile | ProofFile {
  const loose = parseIntent(content, file) as IntentFile | ProofFile;
  if (isProof(loose)) return parseProof(content, file);
  return loose;
}

function isProof(value: IntentFile | ProofFile): value is ProofFile {
  return "proof" in value;
}

function printValidation(result: { valid: boolean; errors: string[]; warnings: string[] }, asJson?: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(result.valid ? "valid" : "invalid");
  for (const error of result.errors) console.log(`error: ${error}`);
  for (const warning of result.warnings) console.log(`warning: ${warning}`);
}

function printVerification(
  intent: IntentFile,
  proof: ProofFile,
  result: ReturnType<typeof verifyIntentProof>,
  asJson?: boolean
): void {
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Intent: ${intent.title}`);
  console.log(`Proof status: ${proof.status}`);
  console.log(`Acceptance: ${result.acceptance.passed}/${result.acceptance.total} passed`);
  console.log(result.valid ? "Verification: passed" : "Verification: failed");
  for (const error of result.errors) console.log(`error: ${error}`);
  for (const warning of result.warnings) console.log(`warning: ${warning}`);
}

async function writeOrPrint(content: string, out?: string): Promise<void> {
  if (!out) {
    process.stdout.write(content);
    return;
  }

  const parent = dirname(out);
  if (parent && parent !== "." && !existsSync(parent)) {
    await mkdir(parent, { recursive: true });
  }
  await writeFile(out, content, "utf8");
  console.log(`wrote ${out}`);
}

function convertAny(value: IntentFile | ProofFile, format: string): string {
  if (format === "yaml") return formatYaml(value);
  if (format === "json") return `${JSON.stringify(value, null, 2)}\n`;
  if (format === "a2a") {
    return `${JSON.stringify(
      {
        kind: isProof(value) ? "intentfile.proof" : "intentfile.intent",
        mimeType: isProof(value)
          ? "application/vnd.intentproof+json;version=0.1"
          : "application/vnd.intentfile+json;version=0.1",
        payload: value
      },
      null,
      2
    )}\n`;
  }
  throw new Error(`unsupported output format "${format}"`);
}

function gitChangedFiles(): string[] {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD"], { encoding: "utf8" });
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function runShell(command: string): number {
  console.log(`running: ${command}`);
  const result = spawnSync(command, { shell: true, stdio: "inherit" });
  return result.status ?? 1;
}

function readGithubIssue(ref: string): {
  owner: string;
  repo: string;
  number: string;
  title: string;
  body: string;
  labels: string[];
  url: string;
} {
  const parsed = parseGithubIssueRef(ref);
  const output = execFileSync(
    "gh",
    [
      "issue",
      "view",
      parsed.number,
      "--repo",
      `${parsed.owner}/${parsed.repo}`,
      "--json",
      "title,body,labels,url,number"
    ],
    { encoding: "utf8" }
  );
  const issue = JSON.parse(output) as {
    title: string;
    body: string;
    labels: Array<{ name: string }>;
    url: string;
    number: number;
  };

  return {
    ...parsed,
    title: issue.title,
    body: issue.body,
    labels: issue.labels.map((label) => label.name),
    url: issue.url
  };
}

function parseGithubIssueRef(ref: string): { owner: string; repo: string; number: string } {
  const urlMatch = ref.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (urlMatch) {
    return { owner: urlMatch[1] ?? "", repo: urlMatch[2] ?? "", number: urlMatch[3] ?? "" };
  }

  const shorthand = ref.match(/^([^/]+)\/([^#]+)#(\d+)$/);
  if (shorthand) {
    return { owner: shorthand[1] ?? "", repo: shorthand[2] ?? "", number: shorthand[3] ?? "" };
  }

  throw new Error("GitHub issue ref must be owner/repo#123 or a GitHub issue URL");
}
