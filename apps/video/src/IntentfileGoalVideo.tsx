import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

const colors = {
  paper: "#fbf8f1",
  ink: "#090b10",
  body: "#303a49",
  muted: "#667085",
  line: "#d8cdbd",
  code: "#141820",
  codeLine: "#2b3343",
  green: "#5f7f63",
  blue: "#465f7f",
  amber: "#a77335",
  rose: "#8d4d53"
};

const fontSans =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
const fontMono = "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace";

export const intentfileGoalVideoFrames = 1080;

const sceneTimeline = [
  { label: "setup", start: 0, end: 198 },
  { label: "problem", start: 180, end: 378 },
  { label: "contract", start: 360, end: 558 },
  { label: "goal", start: 540, end: 738 },
  { label: "proof", start: 720, end: 918 },
  { label: "close", start: 900, end: intentfileGoalVideoFrames }
] as const;

const slideStarts = sceneTimeline.map((scene) => scene.start);

export const IntentfileGoalVideo = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={styles.stage}>
      <Texture />
      <Header />
      <SlideCountdown frame={frame} />
      <SceneLayer start={sceneTimeline[0].start} end={sceneTimeline[0].end}>
        <IntroScene />
      </SceneLayer>
      <SceneLayer start={sceneTimeline[1].start} end={sceneTimeline[1].end}>
        <ProblemScene />
      </SceneLayer>
      <SceneLayer start={sceneTimeline[2].start} end={sceneTimeline[2].end}>
        <ContractScene />
      </SceneLayer>
      <SceneLayer start={sceneTimeline[3].start} end={sceneTimeline[3].end}>
        <GoalScene />
      </SceneLayer>
      <SceneLayer start={sceneTimeline[4].start} end={sceneTimeline[4].end}>
        <ProofScene />
      </SceneLayer>
      <SceneLayer start={sceneTimeline[5].start} end={sceneTimeline[5].end}>
        <ClosingScene />
      </SceneLayer>
      <Progress frame={frame} />
    </AbsoluteFill>
  );
};

const Header = () => {
  return (
    <div style={styles.header}>
      <div style={styles.brand}>intentfile.run</div>
      <div style={styles.headerMeta}>agent CLI + Codex /goal definition-of-done layer</div>
    </div>
  );
};

const Texture = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(9, 11, 16, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(9, 11, 16, 0.035) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        opacity: 0.55
      }}
    />
  );
};

const SceneLayer = ({
  children,
  start,
  end
}: {
  children: ReactNode;
  start: number;
  end: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, start, end);
  const y = interpolate(opacity, [0, 1], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill
      style={{
        ...styles.sceneLayer,
        opacity,
        transform: `translateY(${y}px)`
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });

  return (
    <div style={styles.twoColumn}>
      <div>
        <Kicker>the missing layer</Kicker>
        <h1 style={styles.heroTitle}>
          Make Codex <span style={styles.goalWord}>/goal</span> know what done
          means.
        </h1>
        <p style={styles.lede}>
          Codex can keep moving. intentfile turns the stopping condition into a
          task contract.
        </p>
      </div>
      <div style={{ ...styles.stack, transform: `scale(${0.96 + pop * 0.04})` }}>
        <SignalCard label="Codex /goal" value="persistent objective" tone="blue" />
        <SignalCard label="intentfile" value="definition of done" tone="green" />
        <div style={styles.connector}>persistence + acceptance + proof</div>
      </div>
    </div>
  );
};

const ProblemScene = () => {
  return (
    <div style={styles.centerScene}>
      <Kicker>the problem</Kicker>
      <h2 style={styles.question}>Keep going until what?</h2>
      <div style={styles.problemGrid}>
        <PromptCard title="Vague prompt" lines={["build the feature", "make it good", "ship when done"]} />
        <PromptCard
          title="Intent contract"
          lines={["objective", "constraints", "acceptance", "proof_required"]}
          strong
        />
      </div>
    </div>
  );
};

const ContractScene = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 14), [-1, 1], [0.7, 1]);

  return (
    <div style={styles.twoColumnWide}>
      <div>
        <Kicker>task.intent.yaml</Kicker>
        <h2 style={styles.sectionTitle}>One file defines the job and the stop.</h2>
        <p style={styles.bodyCopy}>
          The agent sees the task, where it may work, what must pass, and what
          receipt it owes before completion.
        </p>
        <div style={{ ...styles.badgeRow, opacity: pulse }}>
          <MiniBadge text="objective" />
          <MiniBadge text="constraints" />
          <MiniBadge text="acceptance" />
          <MiniBadge text="proof" />
        </div>
      </div>
      <CodePanel
        title="task.intent.yaml"
        lines={[
          ["intent: intentfile/v0.1", "plain"],
          ["objective: Launch the landing page.", "green"],
          ["constraints:", "plain"],
          ["  allowed_paths: [apps/site/**, docs/**]", "blue"],
          ["acceptance:", "plain"],
          ["  - command: npm run build", "amber"],
          ["  - statement: Copy prompt is visible.", "amber"],
          ["proof_required:", "plain"],
          ["  - changed_files", "rose"],
          ["  - tests_run", "rose"],
          ["  - acceptance_checklist", "rose"]
        ]}
      />
    </div>
  );
};

const GoalScene = () => {
  return (
    <div style={styles.goalScene}>
      <div style={styles.terminal}>
        <div style={styles.terminalTop}>
          <span>intent CLI for agents</span>
          <span>briefs, goals, proof</span>
        </div>
        <div style={styles.commandLine}>$ npm run intent -- goal task.intent.yaml --target codex</div>
        <div style={styles.goalOutput}>
          /goal Complete the intentfile task in task.intent.yaml. Treat the
          objective, constraints, acceptance criteria, and proof_required as the
          definition of done.
        </div>
      </div>
      <div style={styles.goalCaption}>
        <Kicker>cli agents can use</Kicker>
        <h2 style={styles.sectionTitle}>Render goals, briefs, and proof from the terminal.</h2>
      </div>
    </div>
  );
};

const ProofScene = () => {
  return (
    <div style={styles.twoColumnWide}>
      <div>
        <Kicker>the agent loop</Kicker>
        <h2 style={styles.sectionTitle}>Work continues until proof exists.</h2>
        <div style={styles.timeline}>
          <TimelineItem title="Read intent" detail="objective and boundaries" done />
          <TimelineItem title="Edit safely" detail="allowed paths only" done />
          <TimelineItem title="Run checks" detail="npm test, typecheck, build" done />
          <TimelineItem title="Write proof" detail="receipt before done" done />
        </div>
      </div>
      <div style={styles.receipt}>
        <div style={styles.receiptTitle}>task.proof.yaml</div>
        <ReceiptRow label="changed_files" value="8 files" />
        <ReceiptRow label="tests_run" value="3 passed" />
        <ReceiptRow label="acceptance" value="6/6 passed" />
        <ReceiptRow label="unresolved" value="none" />
        <div style={styles.verified}>Verification: passed</div>
      </div>
    </div>
  );
};

const ClosingScene = () => {
  return (
    <div style={styles.closing}>
      <Kicker>ship the contract, not just the prompt</Kicker>
      <h2 style={styles.closeTitle}>
        /goal keeps Codex moving.
        <br />
        intentfile defines done.
      </h2>
      <div style={styles.url}>Go to intentfile.run to get started.</div>
    </div>
  );
};

const SlideCountdown = ({ frame }: { frame: number }) => {
  const { fps } = useVideoConfig();
  const sceneIndex = getCurrentSceneIndex(frame);
  const currentStart = slideStarts[sceneIndex] ?? 0;
  const nextStart = slideStarts[sceneIndex + 1] ?? intentfileGoalVideoFrames;
  const duration = Math.max(1, nextStart - currentStart);
  const elapsed = Math.max(0, frame - currentStart);
  const remaining = interpolate(elapsed, [0, duration], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const secondsLeft = Math.max(0, Math.ceil((nextStart - frame) / fps));
  const label = sceneTimeline[sceneIndex]?.label ?? "slide";
  const timerText = sceneIndex === sceneTimeline.length - 1
    ? `ends in ${secondsLeft}s`
    : `next slide in ${secondsLeft}s`;

  return (
    <div style={styles.slideTimer}>
      <div style={styles.slideTimerMeta}>
        <span>{label}</span>
        <span>{timerText}</span>
      </div>
      <div style={styles.slideTimerTrack}>
        <div style={{ ...styles.slideTimerFill, width: `${remaining}%` }} />
      </div>
    </div>
  );
};

const Progress = ({ frame }: { frame: number }) => {
  const width = interpolate(frame, [0, intentfileGoalVideoFrames - 1], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div style={styles.progressTrack}>
      <div style={{ ...styles.progressBar, width: `${width}%` }} />
    </div>
  );
};

const Kicker = ({ children }: { children: ReactNode }) => (
  <div style={styles.kicker}>{children}</div>
);

const SignalCard = ({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "blue" | "green";
}) => {
  const accent = tone === "blue" ? colors.blue : colors.green;
  return (
    <div style={{ ...styles.signalCard, borderColor: accent }}>
      <div style={{ ...styles.signalDot, background: accent }} />
      <div>
        <div style={styles.signalLabel}>{label}</div>
        <div style={styles.signalValue}>{value}</div>
      </div>
    </div>
  );
};

const PromptCard = ({
  title,
  lines,
  strong = false
}: {
  title: string;
  lines: string[];
  strong?: boolean;
}) => {
  return (
    <div
      style={{
        ...styles.promptCard,
        borderColor: strong ? colors.green : colors.line,
        background: strong ? "#f7fbf4" : "rgba(255,255,255,0.44)"
      }}
    >
      <div style={styles.promptTitle}>{title}</div>
      {lines.map((line) => (
        <div key={line} style={styles.promptLine}>
          {line}
        </div>
      ))}
    </div>
  );
};

const CodePanel = ({
  title,
  lines
}: {
  title: string;
  lines: Array<[string, "plain" | "green" | "blue" | "amber" | "rose"]>;
}) => {
  return (
    <div style={styles.codePanel}>
      <div style={styles.codeTitle}>{title}</div>
      {lines.map(([line, tone], index) => (
        <div
          key={`${line}-${index}`}
          style={{
            ...styles.codeLine,
            color: codeColor(tone),
            background: tone === "plain" ? "transparent" : "rgba(255,255,255,0.055)"
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

const MiniBadge = ({ text }: { text: string }) => <div style={styles.miniBadge}>{text}</div>;

const TimelineItem = ({
  title,
  detail,
  done
}: {
  title: string;
  detail: string;
  done?: boolean;
}) => {
  return (
    <div style={styles.timelineItem}>
      <div style={{ ...styles.check, background: done ? colors.green : colors.line }}>
        {done ? "ok" : ""}
      </div>
      <div>
        <div style={styles.timelineTitle}>{title}</div>
        <div style={styles.timelineDetail}>{detail}</div>
      </div>
    </div>
  );
};

const ReceiptRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div style={styles.receiptRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};

const sceneOpacity = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, start + 18, end - 18, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

const getCurrentSceneIndex = (frame: number) => {
  for (let index = slideStarts.length - 1; index >= 0; index -= 1) {
    if (frame >= (slideStarts[index] ?? 0)) return index;
  }
  return 0;
};

const codeColor = (tone: "plain" | "green" | "blue" | "amber" | "rose") => {
  if (tone === "green") return "#b7dfb8";
  if (tone === "blue") return "#b9cef3";
  if (tone === "amber") return "#f1c27d";
  if (tone === "rose") return "#f0a4ad";
  return "#eef2f7";
};

const styles: Record<string, CSSProperties> = {
  stage: {
    background: colors.paper,
    color: colors.ink,
    fontFamily: fontSans,
    letterSpacing: 0,
    overflow: "hidden"
  },
  header: {
    position: "absolute",
    top: 48,
    left: 72,
    right: 72,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
    fontSize: 28
  },
  brand: {
    fontWeight: 800,
    textDecoration: "underline",
    textDecorationThickness: 2,
    textUnderlineOffset: 6
  },
  headerMeta: {
    color: colors.muted,
    fontFamily: fontMono,
    fontSize: 22
  },
  slideTimer: {
    position: "absolute",
    top: 104,
    left: 72,
    right: 72,
    zIndex: 24,
    display: "grid",
    gap: 9
  },
  slideTimerMeta: {
    display: "flex",
    justifyContent: "space-between",
    color: colors.muted,
    fontFamily: fontMono,
    fontSize: 17,
    letterSpacing: 0
  },
  slideTimerTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
    background: "rgba(9,11,16,0.1)",
    border: "1px solid rgba(9,11,16,0.08)"
  },
  slideTimerFill: {
    height: "100%",
    borderRadius: 999,
    background: colors.ink
  },
  sceneLayer: {
    padding: "162px 96px 92px"
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 82,
    alignItems: "center",
    height: "100%"
  },
  twoColumnWide: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: 72,
    alignItems: "center",
    height: "100%"
  },
  kicker: {
    color: colors.muted,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: 26
  },
  heroTitle: {
    margin: 0,
    maxWidth: 990,
    fontSize: 112,
    lineHeight: 0.94,
    fontWeight: 800
  },
  goalWord: {
    color: colors.blue
  },
  lede: {
    maxWidth: 820,
    marginTop: 36,
    color: colors.body,
    fontSize: 36,
    lineHeight: 1.32
  },
  stack: {
    display: "grid",
    gap: 26
  },
  signalCard: {
    position: "relative",
    display: "flex",
    gap: 24,
    alignItems: "center",
    padding: "34px 36px",
    border: "3px solid",
    borderRadius: 12,
    background: "rgba(255,255,255,0.52)",
    boxShadow: "0 26px 80px rgba(9,11,16,0.12)"
  },
  signalDot: {
    width: 18,
    height: 18,
    borderRadius: 999
  },
  signalLabel: {
    color: colors.muted,
    fontFamily: fontMono,
    fontSize: 24
  },
  signalValue: {
    marginTop: 8,
    fontSize: 40,
    fontWeight: 800
  },
  connector: {
    justifySelf: "center",
    padding: "16px 22px",
    border: `1px solid ${colors.line}`,
    borderRadius: 8,
    color: colors.body,
    fontFamily: fontMono,
    fontSize: 24,
    background: "rgba(255,255,255,0.46)"
  },
  centerScene: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  question: {
    margin: 0,
    fontSize: 104,
    lineHeight: 0.98
  },
  problemGrid: {
    display: "grid",
    gridTemplateColumns: "0.78fr 1.22fr",
    gap: 36,
    marginTop: 54
  },
  promptCard: {
    padding: 34,
    border: "3px solid",
    borderRadius: 10,
    minHeight: 330
  },
  promptTitle: {
    fontSize: 34,
    fontWeight: 800,
    marginBottom: 26
  },
  promptLine: {
    padding: "14px 0",
    borderTop: `1px solid ${colors.line}`,
    color: colors.body,
    fontFamily: fontMono,
    fontSize: 28
  },
  sectionTitle: {
    margin: 0,
    maxWidth: 760,
    fontSize: 82,
    lineHeight: 0.98,
    fontWeight: 800
  },
  bodyCopy: {
    marginTop: 34,
    maxWidth: 760,
    color: colors.body,
    fontSize: 34,
    lineHeight: 1.36
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 38
  },
  miniBadge: {
    padding: "13px 17px",
    border: `1px solid ${colors.line}`,
    borderRadius: 7,
    background: "rgba(255,255,255,0.5)",
    color: colors.body,
    fontFamily: fontMono,
    fontSize: 22
  },
  codePanel: {
    padding: 34,
    borderRadius: 12,
    background: colors.code,
    border: "3px solid #242936",
    boxShadow: "0 28px 90px rgba(9,11,16,0.2)"
  },
  codeTitle: {
    color: "#9ea8b8",
    fontFamily: fontMono,
    fontSize: 24,
    marginBottom: 24
  },
  codeLine: {
    minHeight: 42,
    padding: "7px 10px",
    borderRadius: 6,
    fontFamily: fontMono,
    fontSize: 25,
    lineHeight: 1.35
  },
  goalScene: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    alignItems: "center",
    height: "100%"
  },
  terminal: {
    alignSelf: "center",
    padding: 40,
    borderRadius: 12,
    background: colors.code,
    border: "3px solid #242936",
    boxShadow: "0 28px 90px rgba(9,11,16,0.22)"
  },
  terminalTop: {
    display: "flex",
    justifyContent: "space-between",
    color: "#9ea8b8",
    fontFamily: fontMono,
    fontSize: 24,
    marginBottom: 34
  },
  commandLine: {
    color: "#eef2f7",
    fontFamily: fontMono,
    fontSize: 36,
    lineHeight: 1.36
  },
  goalOutput: {
    marginTop: 32,
    padding: 30,
    color: "#d8e7d5",
    background: "rgba(95,127,99,0.18)",
    border: "1px solid rgba(183,223,184,0.42)",
    borderRadius: 8,
    fontFamily: fontMono,
    fontSize: 31,
    lineHeight: 1.38
  },
  goalCaption: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 40
  },
  timeline: {
    display: "grid",
    gap: 22,
    marginTop: 44
  },
  timelineItem: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    padding: "20px 0",
    borderTop: `1px solid ${colors.line}`
  },
  check: {
    width: 42,
    height: 42,
    borderRadius: 999,
    color: colors.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 900
  },
  timelineTitle: {
    fontSize: 32,
    fontWeight: 800
  },
  timelineDetail: {
    marginTop: 4,
    color: colors.body,
    fontFamily: fontMono,
    fontSize: 22
  },
  receipt: {
    padding: 42,
    border: `3px solid ${colors.ink}`,
    borderRadius: 12,
    background: "rgba(255,255,255,0.56)",
    boxShadow: "0 28px 90px rgba(9,11,16,0.14)"
  },
  receiptTitle: {
    fontFamily: fontMono,
    color: colors.muted,
    fontSize: 28,
    marginBottom: 30
  },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 30,
    padding: "22px 0",
    borderTop: `1px solid ${colors.line}`,
    color: colors.body,
    fontFamily: fontMono,
    fontSize: 30
  },
  verified: {
    marginTop: 34,
    padding: "24px 28px",
    borderRadius: 8,
    background: colors.green,
    color: colors.paper,
    fontSize: 36,
    fontWeight: 900
  },
  closing: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  closeTitle: {
    margin: 0,
    maxWidth: 1400,
    fontSize: 104,
    lineHeight: 1,
    fontWeight: 850
  },
  url: {
    marginTop: 48,
    padding: "18px 24px",
    border: `2px solid ${colors.line}`,
    borderRadius: 8,
    background: "rgba(255,255,255,0.52)",
    color: colors.body,
    fontFamily: fontMono,
    fontSize: 30
  },
  progressTrack: {
    position: "absolute",
    left: 72,
    right: 72,
    bottom: 42,
    height: 4,
    background: "rgba(9,11,16,0.12)",
    borderRadius: 999,
    overflow: "hidden"
  },
  progressBar: {
    height: "100%",
    background: colors.ink
  }
};
