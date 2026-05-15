export const intentSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://intentfile.dev/schemas/intentfile-v0.1.schema.json",
  title: "intentfile v0.1",
  type: "object",
  additionalProperties: true,
  required: ["intent", "id", "title", "objective", "acceptance", "proof_required"],
  properties: {
    intent: { const: "intentfile/v0.1" },
    id: { type: "string", minLength: 1 },
    title: { type: "string", minLength: 1 },
    created_at: { type: "string", format: "date-time" },
    expires_at: { type: "string", format: "date-time" },
    objective: { type: "string", minLength: 1 },
    background: { type: "string" },
    context: { type: "object", additionalProperties: true },
    inputs: { type: "object", additionalProperties: true },
    constraints: {
      type: "object",
      additionalProperties: true,
      properties: {
        allowed_paths: { type: "array", items: { type: "string" } },
        denied_paths: { type: "array", items: { type: "string" } },
        allowed_tools: { type: "array", items: { type: "string" } },
        denied_tools: { type: "array", items: { type: "string" } },
        allowed_domains: { type: "array", items: { type: "string" } },
        denied_domains: { type: "array", items: { type: "string" } },
        data_rules: { type: "array", items: { type: "string" } }
      }
    },
    budgets: { type: "object", additionalProperties: true },
    acceptance: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: true,
        required: ["id"],
        properties: {
          id: { type: "string", minLength: 1 },
          statement: { type: "string", minLength: 1 },
          command: { type: "string", minLength: 1 },
          must_pass: { type: "boolean" },
          file_exists: { type: "string", minLength: 1 },
          http: {
            type: "object",
            additionalProperties: true,
            required: ["url"],
            properties: {
              method: { type: "string" },
              url: { type: "string", minLength: 1 },
              expect_status: { type: "number" }
            }
          }
        }
      }
    },
    deliverables: {
      type: "array",
      items: { type: "object", additionalProperties: true }
    },
    proof_required: {
      type: "array",
      minItems: 1,
      items: { type: "string" }
    },
    metadata: { type: "object", additionalProperties: true }
  }
} as const;

export const proofSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://intentfile.dev/schemas/proof-v0.1.schema.json",
  title: "intent proof v0.1",
  type: "object",
  additionalProperties: true,
  required: ["proof", "intent_id", "status", "acceptance"],
  properties: {
    proof: { const: "intentproof/v0.1" },
    intent_id: { type: "string", minLength: 1 },
    status: {
      type: "string",
      enum: ["completed", "partial", "blocked", "failed", "rejected"]
    },
    completed_at: { type: "string", format: "date-time" },
    summary: { type: "string" },
    acceptance: {
      type: "object",
      additionalProperties: {
        anyOf: [
          {
            type: "string",
            enum: ["pass", "fail", "partial", "not_checked", "not_applicable"]
          },
          {
            type: "object",
            additionalProperties: true,
            required: ["status"],
            properties: {
              status: {
                type: "string",
                enum: ["pass", "fail", "partial", "not_checked", "not_applicable"]
              },
              notes: { type: "string" },
              command: { type: "string" }
            }
          }
        ]
      }
    },
    tests_run: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        required: ["command", "status"],
        properties: {
          command: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    changed_files: { type: "array", items: { type: "string" } },
    commands_run: { type: "array", items: { type: "string" } },
    unresolved_questions: { type: "array", items: { type: "string" } },
    risk_notes: { type: "array", items: { type: "string" } },
    artifacts: { type: "object", additionalProperties: true }
  }
} as const;
