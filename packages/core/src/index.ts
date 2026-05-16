import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";
import * as addFormatsModule from "ajv-formats";
import { parse, stringify } from "yaml";
import { intentSchema, proofSchema } from "./schemas.js";

export type AcceptanceItem = {
  id: string;
  statement?: string;
  command?: string;
  must_pass?: boolean;
  file_exists?: string;
  http?: {
    method?: string;
    url: string;
    expect_status?: number;
  };
  [key: string]: unknown;
};

export type IntentFile = {
  intent: "intentfile/v0.1";
  id: string;
  title: string;
  created_at?: string;
  expires_at?: string;
  objective: string;
  background?: string;
  context?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  constraints?: {
    allowed_paths?: string[];
    denied_paths?: string[];
    allowed_tools?: string[];
    denied_tools?: string[];
    allowed_domains?: string[];
    denied_domains?: string[];
    data_rules?: string[];
    [key: string]: unknown;
  };
  budgets?: Record<string, unknown>;
  acceptance: AcceptanceItem[];
  deliverables?: Array<Record<string, unknown>>;
  proof_required: string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ProofAcceptanceValue =
  | "pass"
  | "fail"
  | "partial"
  | "not_checked"
  | "not_applicable"
  | {
      status: "pass" | "fail" | "partial" | "not_checked" | "not_applicable";
      notes?: string;
      command?: string;
      [key: string]: unknown;
    };

export type ProofFile = {
  proof: "intentproof/v0.1";
  intent_id: string;
  status: "completed" | "partial" | "blocked" | "failed" | "rejected";
  completed_at?: string;
  summary?: string;
  acceptance: Record<string, ProofAcceptanceValue>;
  tests_run?: Array<{ command: string; status: string; [key: string]: unknown }>;
  changed_files?: string[];
  commands_run?: string[];
  unresolved_questions?: string[];
  risk_notes?: string[];
  artifacts?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type VerificationResult = ValidationResult & {
  acceptance: {
    total: number;
    passed: number;
    failed: number;
    missing: number;
  };
};

export type GoalRenderOptions = {
  target?: string;
  format?: "command" | "markdown";
  intentPath?: string;
  proofPath?: string;
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
const addFormats = (addFormatsModule.default ?? addFormatsModule) as unknown as (instance: Ajv2020) => void;
addFormats(ajv);

const validateIntentSchema = ajv.compile(intentSchema);
const validateProofSchema = ajv.compile(proofSchema);

const riskyTools = new Set(["payment.charge", "email.send", "secrets.read"]);
const proofSectionAliases: Record<string, string[]> = {
  acceptance_checklist: ["acceptance"],
  changed_files: ["changed_files"],
  tests_run: ["tests_run"],
  commands_run: ["commands_run"],
  unresolved_questions: ["unresolved_questions"],
  risk_notes: ["risk_notes"],
  screenshots: ["screenshots"],
  commit: ["commit", "artifacts"],
  pull_request: ["pull_request", "artifacts"]
};

export function createIntentId(prefix = "intent"): string {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 26)}`;
}

export function parseIntent(content: string, source = "intent"): IntentFile {
  return parseStructured(content, source) as IntentFile;
}

export function parseProof(content: string, source = "proof"): ProofFile {
  return parseStructured(content, source) as ProofFile;
}

export async function readIntentFile(filePath: string): Promise<IntentFile> {
  return parseIntent(await readFile(filePath, "utf8"), filePath);
}

export async function readProofFile(filePath: string): Promise<ProofFile> {
  return parseProof(await readFile(filePath, "utf8"), filePath);
}

export function formatYaml(value: unknown): string {
  return stringify(value, {
    lineWidth: 88,
    singleQuote: false,
    sortMapEntries: false
  });
}

export function validateIntent(intent: IntentFile): ValidationResult {
  const errors = schemaErrors(validateIntentSchema(intent), validateIntentSchema.errors);
  const warnings: string[] = [];

  const seen = new Set<string>();
  for (const item of intent.acceptance ?? []) {
    if (seen.has(item.id)) {
      errors.push(`acceptance id "${item.id}" is duplicated`);
    }
    seen.add(item.id);

    if (!item.statement && !item.command && !item.file_exists && !item.http) {
      errors.push(`acceptance "${item.id}" must define statement, command, file_exists, or http`);
    }
  }

  if (!intent.acceptance?.some((item) => item.command)) {
    warnings.push("no command-based acceptance criteria declared");
  }

  if (!intent.constraints?.denied_paths?.length) {
    warnings.push("no denied paths declared");
  }

  if (!intent.constraints?.denied_tools?.length) {
    warnings.push("no denied tools declared");
  }

  if (intent.proof_required?.length === 1 && intent.proof_required[0] === "changed_files") {
    warnings.push("proof requirements only ask for changed_files");
  }

  if (intent.expires_at) {
    const expiresAt = Date.parse(intent.expires_at);
    if (Number.isNaN(expiresAt)) {
      errors.push("expires_at must be a valid timestamp");
    } else if (expiresAt < Date.now()) {
      warnings.push("intent has expired");
    }
  }

  for (const path of intent.constraints?.allowed_paths ?? []) {
    if (["*", "**", "./**", "**/*"].includes(path)) {
      warnings.push(`allowed path "${path}" is very broad`);
    }
  }

  for (const tool of intent.constraints?.allowed_tools ?? []) {
    if (riskyTools.has(tool)) {
      warnings.push(`risky tool "${tool}" is allowed`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateProof(proof: ProofFile): ValidationResult {
  const errors = schemaErrors(validateProofSchema(proof), validateProofSchema.errors);
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function createStarterIntent(title: string, template = "feature"): IntentFile {
  const normalizedTitle = title.trim() || "Untitled task";
  const presets = templatePresets[template] ?? templatePresets.feature;

  return {
    intent: "intentfile/v0.1",
    id: createIntentId(),
    title: normalizedTitle,
    created_at: new Date().toISOString(),
    objective: presets.objective(normalizedTitle),
    background: "Add context that helps the agent understand why this matters.",
    constraints: {
      allowed_paths: presets.allowed_paths,
      denied_paths: [".env", ".env.*", "infra/production/**"],
      allowed_tools: ["shell", "git"],
      denied_tools: ["payment.charge", "email.send", "secrets.read"],
      data_rules: ["Do not expose secrets.", "Do not modify production configuration."]
    },
    acceptance: presets.acceptance,
    deliverables: presets.deliverables,
    proof_required: ["changed_files", "tests_run", "acceptance_checklist", "unresolved_questions"]
  };
}

export function createStarterProof(intent: IntentFile): ProofFile {
  return {
    proof: "intentproof/v0.1",
    intent_id: intent.id,
    status: "partial",
    summary: "Replace this with a short summary of what changed.",
    acceptance: Object.fromEntries(
      intent.acceptance.map((item) => [
        item.id,
        {
          status: "not_checked",
          notes: item.command ? `Command acceptance: ${item.command}` : "Add proof notes."
        }
      ])
    ),
    tests_run: intent.acceptance
      .filter((item) => item.command)
      .map((item) => ({ command: item.command ?? "", status: "not_run" })),
    changed_files: [],
    commands_run: [],
    unresolved_questions: [],
    risk_notes: []
  };
}

export function renderBrief(intent: IntentFile, target = "generic"): string {
  const lines: string[] = [];
  lines.push(`# ${intent.title}`);
  lines.push("");
  lines.push("You are receiving an intentfile task contract. Follow the contract, stay inside the declared boundaries, and return the required proof.");
  lines.push("");
  lines.push("## Objective");
  lines.push(intent.objective);

  if (intent.background) {
    lines.push("", "## Background", intent.background);
  }

  if (intent.context && Object.keys(intent.context).length > 0) {
    lines.push("", "## Context", fencedYaml(intent.context));
  }

  if (intent.inputs && Object.keys(intent.inputs).length > 0) {
    lines.push("", "## Inputs", fencedYaml(intent.inputs));
  }

  if (intent.constraints) {
    lines.push("", "## Constraints", fencedYaml(intent.constraints));
  }

  if (intent.budgets) {
    lines.push("", "## Budgets", fencedYaml(intent.budgets));
  }

  lines.push("", "## Acceptance Criteria");
  for (const item of intent.acceptance) {
    lines.push(`- ${item.id}: ${describeAcceptance(item)}`);
  }

  if (intent.deliverables?.length) {
    lines.push("", "## Deliverables", fencedYaml(intent.deliverables));
  }

  lines.push("", "## Required Proof");
  for (const requirement of intent.proof_required) {
    lines.push(`- ${requirement}`);
  }

  lines.push("", "## Final Response Format");
  lines.push("Return a concise summary plus the proof fields requested above. Be explicit about commands run, changed files, and any unresolved questions.");

  if (target === "codex") {
    lines.push("", "## Codex Notes");
    lines.push("Use repository-local conventions, do not revert unrelated user changes, and verify with the listed commands when possible.");
  }

  if (target === "claude-code") {
    lines.push("", "## Claude Code Notes");
    lines.push("Plan briefly, edit only allowed paths, and include proof in the final response.");
  }

  if (target === "cursor") {
    lines.push("", "## Cursor Notes");
    lines.push("Use the acceptance list as the source of truth for edits and verification.");
  }

  return `${lines.join("\n")}\n`;
}

export function renderGoal(intent: IntentFile, options: GoalRenderOptions = {}): string {
  const target = options.target ?? "codex";
  const format = options.format ?? "command";

  if (target !== "codex") {
    throw new Error(`unsupported goal target "${target}"; supported target: codex`);
  }

  if (format === "command") {
    return renderCodexGoalCommand(intent, options);
  }

  if (format === "markdown") {
    return renderCodexGoalMarkdown(intent, options);
  }

  throw new Error(`unsupported goal format "${format}"; use command or markdown`);
}

export function verifyIntentProof(intent: IntentFile, proof: ProofFile): VerificationResult {
  const intentValidation = validateIntent(intent);
  const proofValidation = validateProof(proof);
  const errors = [...intentValidation.errors, ...proofValidation.errors];
  const warnings = [...intentValidation.warnings, ...proofValidation.warnings];
  let passed = 0;
  let failed = 0;
  let missing = 0;

  if (proof.intent_id !== intent.id) {
    errors.push(`proof intent_id "${proof.intent_id}" does not match intent id "${intent.id}"`);
  }

  for (const requirement of intent.proof_required) {
    if (!hasProofSection(proof, requirement)) {
      errors.push(`required proof section "${requirement}" is missing`);
    }
  }

  for (const item of intent.acceptance) {
    const proofValue = proof.acceptance?.[item.id];
    const status = getProofStatus(proofValue);

    if (!status) {
      missing += 1;
      errors.push(`acceptance "${item.id}" has no proof status`);
      continue;
    }

    if (status === "pass" || status === "not_applicable") {
      passed += 1;
    } else {
      failed += 1;
      errors.push(`acceptance "${item.id}" is ${status}`);
    }

    if (item.statement && status === "pass" && !getProofNotes(proofValue)) {
      warnings.push(`manual acceptance "${item.id}" is pass without notes`);
    }

    if (item.command && item.must_pass !== false && !proofCommandPassed(proof, item.command)) {
      warnings.push(`command acceptance "${item.id}" has no passed tests_run entry for "${item.command}"`);
    }
  }

  for (const filePath of proof.changed_files ?? []) {
    if (intent.constraints?.denied_paths?.some((pattern) => matchesGlob(filePath, pattern))) {
      warnings.push(`changed file "${filePath}" matches denied_paths`);
    }

    const allowedPaths = intent.constraints?.allowed_paths ?? [];
    if (allowedPaths.length > 0 && !allowedPaths.some((pattern) => matchesGlob(filePath, pattern))) {
      warnings.push(`changed file "${filePath}" is outside allowed_paths`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    acceptance: {
      total: intent.acceptance.length,
      passed,
      failed,
      missing
    }
  };
}

export function describeAcceptance(item: AcceptanceItem): string {
  if (item.statement) return item.statement;
  if (item.command) return `run \`${item.command}\`${item.must_pass === false ? "" : " and pass"}`;
  if (item.file_exists) return `file exists: \`${item.file_exists}\``;
  if (item.http) {
    const method = item.http.method ?? "GET";
    const status = item.http.expect_status ? ` expecting ${item.http.expect_status}` : "";
    return `${method} ${item.http.url}${status}`;
  }
  return "unspecified acceptance";
}

function renderCodexGoalCommand(intent: IntentFile, options: GoalRenderOptions): string {
  const source = options.intentPath ? ` in ${options.intentPath}` : ` with id ${intent.id}`;
  return [
    `/goal Complete the intentfile task "${intent.title}"${source}.`,
    "Treat the intent objective, constraints, acceptance criteria, and proof_required as the definition of done.",
    "Keep working until every acceptance item is proven in a proof file, or stop with unresolved_questions and blocker details."
  ].join(" ") + "\n";
}

function renderCodexGoalMarkdown(intent: IntentFile, options: GoalRenderOptions): string {
  const lines: string[] = [];
  const source = options.intentPath ?? intent.id;
  const proofPath = options.proofPath ?? defaultProofPath(options.intentPath);

  lines.push(`# Codex Goal: ${intent.title}`);
  lines.push("");
  lines.push("Use this as the durable goal document for Codex `/goal`.");
  lines.push("");
  lines.push("```text");
  lines.push("/goal follow the instructions in this goal file");
  lines.push("```");
  lines.push("");
  lines.push("## Source Intent");
  lines.push(`- Intent: \`${source}\``);
  lines.push(`- Intent id: \`${intent.id}\``);
  lines.push(`- Proof target: \`${proofPath}\``);
  lines.push("");
  lines.push("## Objective");
  lines.push(intent.objective);

  if (intent.background) {
    lines.push("", "## Background", intent.background);
  }

  if (intent.constraints) {
    lines.push("", "## Constraints", fencedYaml(intent.constraints));
  }

  lines.push("", "## Definition Of Done");
  lines.push("- The objective above is satisfied.");
  lines.push("- Every acceptance item below is pass, or explicitly not_applicable with notes.");
  lines.push("- Required proof sections are present in the proof file or final proof-shaped response.");
  lines.push("- Command acceptance criteria have passed command evidence when they can run in this workspace.");
  lines.push("- Remaining blockers are reported under unresolved_questions instead of being hidden.");

  lines.push("", "## Acceptance Criteria");
  for (const item of intent.acceptance) {
    lines.push(`- ${item.id}: ${describeAcceptance(item)}`);
  }

  lines.push("", "## Required Proof");
  for (const requirement of intent.proof_required) {
    lines.push(`- ${requirement}`);
  }

  lines.push("", "## Completion Procedure");
  lines.push(`1. Open and follow the source intent \`${source}\`.`);
  lines.push("2. Validate the intent before doing substantial work.");
  lines.push("3. Make only changes allowed by the intent constraints.");
  lines.push(`4. Produce proof at \`${proofPath}\` or include the same fields in the final response.`);
  lines.push("5. Verify proof against the intent before calling the goal complete.");

  return `${lines.join("\n")}\n`;
}

function defaultProofPath(intentPath?: string): string {
  if (!intentPath) return "task.proof.yaml";
  if (intentPath.endsWith(".intent.yaml")) return intentPath.replace(/\.intent\.yaml$/, ".proof.yaml");
  if (intentPath.endsWith(".intent.yml")) return intentPath.replace(/\.intent\.yml$/, ".proof.yml");
  if (intentPath.endsWith(".intent.json")) return intentPath.replace(/\.intent\.json$/, ".proof.json");
  return "task.proof.yaml";
}

function parseStructured(content: string, source: string): unknown {
  try {
    if (source.endsWith(".json") || content.trimStart().startsWith("{")) {
      return JSON.parse(content) as unknown;
    }
    return parse(content) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`failed to parse ${source}: ${message}`);
  }
}

function schemaErrors(valid: boolean, errors: ErrorObject[] | null | undefined): string[] {
  if (valid) return [];
  return (errors ?? []).map((error) => {
    const path = error.instancePath || "/";
    return `${path} ${error.message ?? "is invalid"}`;
  });
}

function fencedYaml(value: unknown): string {
  return `\`\`\`yaml\n${formatYaml(value).trim()}\n\`\`\``;
}

function hasProofSection(proof: ProofFile, requirement: string): boolean {
  const candidates = proofSectionAliases[requirement] ?? [requirement];
  return candidates.some((candidate) => {
    const value = proof[candidate];
    if (Array.isArray(value)) return true;
    if (value && typeof value === "object") return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== "";
  });
}

function getProofStatus(value: ProofAcceptanceValue | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.status;
}

function getProofNotes(value: ProofAcceptanceValue | undefined): string | undefined {
  if (!value || typeof value === "string") return undefined;
  return value.notes;
}

function proofCommandPassed(proof: ProofFile, command: string): boolean {
  return (proof.tests_run ?? []).some((test) => test.command === command && test.status === "passed");
}

function matchesGlob(filePath: string, pattern: string): boolean {
  if (pattern === filePath) return true;
  if (pattern.endsWith("/**")) {
    return filePath.startsWith(pattern.slice(0, -3));
  }

  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replaceAll("**", "\0")
    .replaceAll("*", "[^/]*")
    .replaceAll("\0", ".*");

  return new RegExp(`^${escaped}$`).test(filePath);
}

const templatePresets: Record<
  string,
  {
    objective: (title: string) => string;
    allowed_paths: string[];
    acceptance: AcceptanceItem[];
    deliverables: Array<Record<string, unknown>>;
  }
> = {
  feature: {
    objective: (title) => `Implement: ${title}.`,
    allowed_paths: ["src/**", "tests/**", "docs/**"],
    acceptance: [
      { id: "A1", statement: "The requested feature is implemented." },
      { id: "A2", statement: "Relevant user-facing behavior is documented or self-evident." },
      { id: "A3", command: "npm test", must_pass: true }
    ],
    deliverables: [
      { type: "code", description: "Implementation changes." },
      { type: "tests", description: "Focused coverage for the new behavior." }
    ]
  },
  bugfix: {
    objective: (title) => `Fix the bug: ${title}.`,
    allowed_paths: ["src/**", "tests/**", "docs/**"],
    acceptance: [
      { id: "A1", statement: "The bug is reproduced or clearly understood." },
      { id: "A2", statement: "The bug is fixed without broad unrelated changes." },
      { id: "A3", command: "npm test", must_pass: true }
    ],
    deliverables: [
      { type: "code", description: "Bug fix." },
      { type: "tests", description: "Regression coverage when practical." }
    ]
  },
  research: {
    objective: (title) => `Research and summarize: ${title}.`,
    allowed_paths: ["docs/**", "research/**"],
    acceptance: [
      { id: "A1", statement: "The research question is answered with sources or clear reasoning." },
      { id: "A2", statement: "Open questions and risks are listed." },
      { id: "A3", file_exists: "docs/research-notes.md" }
    ],
    deliverables: [{ type: "docs", description: "Research summary." }]
  },
  docs: {
    objective: (title) => `Update documentation for: ${title}.`,
    allowed_paths: ["README.md", "docs/**", "examples/**"],
    acceptance: [
      { id: "A1", statement: "Documentation explains the target workflow clearly." },
      { id: "A2", statement: "Examples are copyable and current." }
    ],
    deliverables: [{ type: "docs", description: "Documentation updates." }]
  },
  "dependency-upgrade": {
    objective: (title) => `Upgrade dependency safely: ${title}.`,
    allowed_paths: ["package.json", "package-lock.json", "src/**", "tests/**", "docs/**"],
    acceptance: [
      { id: "A1", statement: "The dependency is upgraded." },
      { id: "A2", statement: "Migration notes are handled or documented." },
      { id: "A3", command: "npm test", must_pass: true },
      { id: "A4", command: "npm run build", must_pass: true }
    ],
    deliverables: [
      { type: "code", description: "Version and compatibility changes." },
      { type: "docs", description: "Migration notes if behavior changed." }
    ]
  },
  "frontend-change": {
    objective: (title) => `Implement frontend change: ${title}.`,
    allowed_paths: ["app/**", "src/**", "components/**", "styles/**", "tests/**"],
    acceptance: [
      { id: "A1", statement: "The UI change works across desktop and mobile widths." },
      { id: "A2", statement: "Interactive states and accessibility basics are handled." },
      { id: "A3", command: "npm run build", must_pass: true }
    ],
    deliverables: [
      { type: "code", description: "Frontend implementation." },
      { type: "screenshots", description: "Before or after screenshots when possible." }
    ]
  }
};
